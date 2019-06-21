import { combineReducers } from 'redux';
import {
  outerReducer,
  innerReducer
} from 'redux-async-initial-state';
import mapView from './MapViewReducer';
import loadingQueue from './LoadingReducer';
import appInfo  from './ApplicationInfoReducer';
import mapLayers from './MapLayersReducer';
import activeModules  from './ActiveModulesReducer';
import fetchRemoteFeaturesOfType  from './RemoteFeatureReducer';

// We need outerReducer to replace full state as soon as it has loaded
const baseclientMainReducer = outerReducer(combineReducers({
  mapView,
  loadingQueue,
  appInfo,
  mapLayers,
  activeModules,
  appContext: (appContext = {}) => appContext,
  hoverFeatures: fetchRemoteFeaturesOfType('HOVER'),
  // We need innerReducer to store loading state, i.e. for showing loading spinner
  asyncInitialState: innerReducer
}));
export default baseclientMainReducer;
