import { combineReducers } from '@reduxjs/toolkit';

import mapView from './mapView';
import loadingQueue from './loadingQueue';
import appInfo from './appInfo';
import mapLayers from './mapLayers';
import activeModules from './activeModules';
import hoverFeatures from './hoverFeatures/reducer';
import dataRange from './dataRange';
import appState from './appState';

const baseclientMainReducers = {
  mapView,
  loadingQueue,
  appInfo,
  userInfo: (state: unknown = {}) => state,
  mapLayers,
  activeModules,
  defaultTopic: (state: unknown = {}) => state,
  mapScales: (state: unknown = {}) => state,
  appState,
  appContext: (appContext: unknown = {}) => appContext,
  hoverFeatures: hoverFeatures,
  dataRange
};

export const reducer = combineReducers(baseclientMainReducers);

export type BaseClientState = ReturnType<typeof reducer>;

export default baseclientMainReducers;
