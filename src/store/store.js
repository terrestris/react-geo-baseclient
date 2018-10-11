import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { middleware } from 'redux-async-initial-state';

import baseclientMainReducer from '../reducers/Reducer';
import appContextUtil from '../util/AppContextUtil';
import config from '../config/config';
import Logger from '@terrestris/base-util';

const loggerMiddleware = createLogger({
  collapsed: true
});

/**
 * Load loadAppContextStore function
 * Should return promise that resolves application state
 * @return {Promise} A promise
 */
const loadAppContextStore = () => {
  return new Promise((resolve) => {
    const appId = window.location.href.split('applicationId=')[1] || '';
    fetch(config.appContextPath + '/' + appId, {
      credentials: 'same-origin'
    }).then(response => response.json())
      .then((appContext) => {
        appContext = appContext instanceof Array ? appContext[0] : appContext;
        let state = appContextUtil.appContextToState(appContext);
        resolve(state);
      });
  }).catch((err) => {
    Logger.error(err.stack);
  });
};

const store = createStore(
  baseclientMainReducer,
  compose(
    applyMiddleware(middleware(loadAppContextStore))
  ),
  applyMiddleware(thunkMiddleware, loggerMiddleware)
);

export default store;
