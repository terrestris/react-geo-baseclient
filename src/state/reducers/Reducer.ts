import { combineReducers } from '@reduxjs/toolkit';

import mapView from './MapViewReducer';
import loadingQueue from './LoadingReducer';
import appInfo from './ApplicationInfoReducer';
import mapLayers from './MapLayersReducer';
import activeModules from './ActiveModulesReducer';
import fetchRemoteFeaturesOfType from './RemoteFeatureReducer';
import dataRange from './DataRangeReducer';
import appState from './AppStateReducer';

const baseclientMainReducers = {
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
  dataRange
};

const reducer = combineReducers(baseclientMainReducers);

export type BaseClientState = ReturnType<typeof reducer>;

export default baseclientMainReducers;
