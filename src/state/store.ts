import {
  createStore,
  applyMiddleware,
  compose
} from 'redux';

import thunkMiddleware from 'redux-thunk';

import { createLogger } from 'redux-logger';

import { middleware } from 'redux-async-initial-state';

import Logger from '@terrestris/base-util/dist/Logger';

import baseclientMainReducer from './reducers/Reducer';
import { getAppContextUtil } from '../util/getAppContextUtil';

import config from '../config/config';

const env = process.env.NODE_ENV;

const loggerMiddleware = env === 'development' ? createLogger({
  collapsed: true,
  predicate: (getState, action) => !action.type.endsWith('_LOADING')
}) : middleware();

const composeEnhancers = (window && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

/**
 * Load loadAppContextStore function
 * Should return promise that resolves application state
 * @return {Promise} A promise
 */
const loadAppContextStore = async () => {
  const url = new URL(window.location.href);
  const appId = url.searchParams.get('applicationId');

  let appContext;

  let appContextPath = config.appContextPath;

  const staticPath = appContextPath.indexOf('/resources/appContext.json') > -1;

  if (appId || staticPath) {

    if (appId) {
      appContextPath = appContextPath.endsWith('/') ?
        `${appContextPath}${appId}` :
        `${appContextPath}/${appId}`;
    }

    const response = await fetch(appContextPath, {
      credentials: 'same-origin'
    });

    if (response.status === 404) {
      throw new Error('Application not found for the given id.');
    }

    try {
      appContext = await response.json();
    } catch (err) {
      throw new Error('Could not parse the application context.');
    }

    appContext = appContext instanceof Array ? appContext[0] : appContext;

    // Set the app name as document title.
    document.title = appContext.name;

    // Set the favicon.
    if (appContext.favicon) {
      const faviconEl = document.querySelector('link[rel~="icon"]');
      faviconEl.setAttribute('href', `${config.getBasePath()}${appContext.favicon}`);
    }
  } else {
    Logger.info('No application ID given, the default app context will be be applied.');
  }

  const state = await getAppContextUtil().appContextToState(appContext);

  return state;
};

const store = createStore(
  baseclientMainReducer,
  composeEnhancers(
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
