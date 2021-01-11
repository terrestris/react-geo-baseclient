import {
  createStore,
  applyMiddleware,
  compose
} from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { middleware } from 'redux-async-initial-state';

import baseclientMainReducer from './reducers/Reducer';
import appContextUtil from '../util/AppContextUtil';
import config from '../config/config';
import Logger from '@terrestris/base-util/dist/Logger';

const env = process.env.NODE_ENV;

const loggerMiddleware = env === 'development' ? createLogger({
  collapsed: true,
  predicate: (getState, action) => !action.type.endsWith('_LOADING')
}) : middleware();

/**
 * Load loadAppContextStore function
 * Should return promise that resolves application state
 * @return {Promise} A promise
 */
const loadAppContextStore = () => {
  return new Promise((resolve, reject) => {
    const appId = window.location.href.split('applicationId=')[1] || undefined;
    let appContextPath = config.appContextPath;
    if (appId) {
      appContextPath = appContextPath.endsWith('/') ?
        `${appContextPath}${appId}` :
        `${appContextPath}/${appId}`;
    }

    fetch(appContextPath, {
      credentials: 'same-origin'
    }).then(response => {
      if (response.status === 404) {
        throw new Error('Application not found for the given id.');
      }
      try {
        return response.json();
      } catch (err) {
        throw new Error('Could not parse the application context.');
      }
    })
      .then(appContext => {
        appContext = appContext instanceof Array ? appContext[0] : appContext;
        // set app name as document title
        document.title = appContext.name || 'react-geo-baseclient';
        // set favicon
        const faviconEl = document.querySelector('link[rel~="icon"]');
        const faviconUrl =
          appContext.favicon ? `${config.getBasePath()}${appContext.favicon}`
            : 'favicon.ico';
        faviconEl.setAttribute('href', faviconUrl);

        const state = appContextUtil.appContextToState(appContext);
        resolve(state);
      })
      .catch(err => {
        Logger.error(err.stack);
        reject(err);
      });
  });
};

const store = createStore(
  baseclientMainReducer,
  compose(
    applyMiddleware(middleware(loadAppContextStore)),
    applyMiddleware(thunkMiddleware, loggerMiddleware)
  )
);

// An initial dispatch to trigger the execution of all middlewares. This is
// needed to fetch the application context via loadAppContextStore().
store.dispatch({
  type: 'INIT_APPLICATION'
});

export default store;
