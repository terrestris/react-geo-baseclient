import { combineReducers } from '@reduxjs/toolkit';

import mapView from './mapView/reducer';
import loadingQueue from './loadingQueue/reducer';
import appInfo from './appInfo/reducer';
import mapLayers from './mapLayers/reducer';
import activeModules from './activeModules/reducer';
import hoverFeatures from './hoverFeatures/reducer';
import dataRange from './dataRange/reducer';
import appState from './appState/reducer';

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
  hoverFeatures: hoverFeatures,
  dataRange
};

const reducer = combineReducers(baseclientMainReducers);

export type BaseClientState = ReturnType<typeof reducer>;

export default baseclientMainReducers;
