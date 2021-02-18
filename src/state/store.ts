import {
  createStore,
  applyMiddleware,
  compose
} from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { middleware } from 'redux-async-initial-state';

import baseclientMainReducer from './reducers/Reducer';
import { getAppContextUtil } from '../util/getAppContextUtil';
import config from '../config/config';

import AppInfoService from '../service/AppInfoService/AppInfoService';
import UserService from '../service/UserService/UserService';

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
const loadAppContextStore = async () => {
  const appId = window.location.href.split('applicationId=')[1] || undefined;

  let appState: any = {};

  // TODO Move to appContextParser
  const appInfoService = new AppInfoService();
  const userService = new UserService();

  const appInfo = await appInfoService.getAppInfo();

  const userInfo = await userService.findOne(appInfo.userId);

  appState.appInfo = appInfo;
  appState.userInfo = userInfo;

  if (!appId) {
    return appState;
  }

  let appContextPath = config.appContextPath;
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

  let appContext;
  try {
    appContext = await response.json();
  } catch (err) {
    throw new Error('Could not parse the application context.');
  }

  appContext = appContext instanceof Array ? appContext[0] : appContext;
  // set app name as document title
  document.title = appContext.name || 'react-geo-baseclient';
  // set favicon
  const faviconEl = document.querySelector('link[rel~="icon"]');
  const faviconUrl =
    appContext.favicon ? `${config.getBasePath()}${appContext.favicon}`
      : 'favicon.ico';
  faviconEl.setAttribute('href', faviconUrl);

  const state = await getAppContextUtil().appContextToState(appContext);

  appState = {
    ...appState,
    ...state
  }

  return appState;
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
