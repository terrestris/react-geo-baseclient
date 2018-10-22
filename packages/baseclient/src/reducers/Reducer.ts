import { combineReducers } from 'redux';
import {
  outerReducer,
  innerReducer
} from 'redux-async-initial-state';
import { MapViewReducer } from 'baseclient-state';
import { LoadingReducer } from 'baseclient-state';
import { ApplicationInfoReducer } from 'baseclient-state';
import { MapLayersReducer } from 'baseclient-state';
import { ActiveModulesReducer } from 'baseclient-state';
// We need outerReducer to replace full state as soon as it has loaded
const baseclientMainReducer = outerReducer(combineReducers({
  mapView: MapViewReducer.reduce,
  loadingQueue: LoadingReducer.reduce,
  appInfo: ApplicationInfoReducer.reduce,
  mapLayers: MapLayersReducer.reduce,
  activeModules: ActiveModulesReducer.reduce,
  // We need innerReducer to store loading state, i.e. for showing loading spinner
  asyncInitialState: innerReducer
}));
export default baseclientMainReducer;