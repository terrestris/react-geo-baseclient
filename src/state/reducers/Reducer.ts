import { combineReducers } from 'redux';
import {
  outerReducer,
  innerReducer
} from 'redux-async-initial-state';
import mapView from './MapViewReducer';
import loadingQueue from './LoadingReducer';
import appInfo from './ApplicationInfoReducer';
import mapLayers from './MapLayersReducer';
import activeModules from './ActiveModulesReducer';
import fetchRemoteFeaturesOfType from './RemoteFeatureReducer';
import dataRange from './DataRangeReducer';
import appState from './AppStateReducer';
import { Logger } from '@terrestris/base-util';

let projectReducer = {};
if (process.env.PROJECT_REDUCER_PATH) {
  try {
    const context = require('../../' + process.env.PROJECT_MAIN_PATH + process.env.PROJECT_REDUCER_PATH);
    if (context.default) {
      projectReducer = context.default;
    }
  } catch (error) {
    Logger.info('Could not load the specified project reducer. ' +
      'Please check if the path in the .env is set correctly: ', error
    );
  }
}

const baseclientMainReducer = {
  mapView,
  loadingQueue,
  appInfo,
  userInfo: (state = {}) => state,
  mapLayers,
  activeModules,
  defaultTopic: (state = {}) => state,
  mapScales: (state = {}) => state,
  appState,
  appContext: (appContext = {}) => appContext,
  hoverFeatures: fetchRemoteFeaturesOfType('HOVER'),
  dataRange,
  // We need innerReducer to store loading state, i.e. for showing loading spinner
  asyncInitialState: innerReducer
};

// We need outerReducer to replace full state as soon as it has loaded
const rootReducer = outerReducer(combineReducers({
  ...baseclientMainReducer,
  ...projectReducer
}));

export type BaseClientState = ReturnType<typeof rootReducer>;

export default rootReducer;
