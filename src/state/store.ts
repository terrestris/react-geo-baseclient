import {
  configureStore,
  MiddlewareArray
} from '@reduxjs/toolkit';

import thunkMiddleware from 'redux-thunk';

import { createLogger } from 'redux-logger';

import Logger from '@terrestris/base-util/dist/Logger';

import rootReducer, { BaseClientState } from './reducer';
import { getAppContextUtil } from '../util/getAppContextUtil';

import config from '../config/config';

const env = process.env.NODE_ENV;

export const loadAppContextStore = async (): Promise<BaseClientState> => {
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
      faviconEl.setAttribute('href', `${config.getBackendPath()}${appContext.favicon}`);
    }
  } else {
    Logger.info('No application ID given, the default app context will be be applied.');
  }

  const state = await getAppContextUtil().appContextToState(appContext);

  return state;
};

let projectReducer = {};
if (process.env.PROJECT_REDUCER_PATH) {
  try {
    const context = require('../' + process.env.PROJECT_MAIN_PATH + process.env.PROJECT_REDUCER_PATH);
    if (context.default) {
      projectReducer = context.default;
    }
  } catch (error) {
    Logger.info('Could not load the specified project reducer. ' +
      'Please check if the path in the .env is set correctly: ', error
    );
  }
}

export const setupStore = (preloadedState?: BaseClientState) => {
  const middleware: any[] = new MiddlewareArray().concat(thunkMiddleware);

  if (env === 'development') {
    const loggerMiddleware = createLogger({
      collapsed: true,
      predicate: (getState, action) => !action.type.endsWith('_LOADING'),
    });

    middleware.push(loggerMiddleware);
  }

  const store = configureStore({
    reducer: {
      ...rootReducer,
      ...projectReducer
    },
    middleware,
    devTools: env !== 'production',
    preloadedState: preloadedState ? preloadedState : {}
  });

  return store;
};
