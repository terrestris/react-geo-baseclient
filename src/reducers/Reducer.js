import { combineReducers } from 'redux';
import mapView from './MapViewReducer';
import loadingQueue from './LoadingReducer';
import appInfo from './ApplicationInfoReducer';
import mapLayers from './MapLayersReducer';
import activeModules from './ActiveModulesReducer';
import * as asyncInitialState from 'redux-async-initial-state';

// We need outerReducer to replace full state as soon as it has loaded
const baseclientMainReducer = asyncInitialState.outerReducer(combineReducers({
  mapView,
  loadingQueue,
  appInfo,
  mapLayers,
  activeModules,
  // We need innerReducer to store loading state, i.e. for showing loading spinner
  asyncInitialState: asyncInitialState.innerReducer
}));

export default baseclientMainReducer;
