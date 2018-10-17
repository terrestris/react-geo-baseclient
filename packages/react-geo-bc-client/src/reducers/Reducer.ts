import { combineReducers } from 'redux';
import {
  outerReducer,
  innerReducer
} from 'redux-async-initial-state';

import { MapViewReducer } from 'react-geo-bc-state';
import { LoadingReducer } from 'react-geo-bc-state';
import { ApplicationInfoReducer } from 'react-geo-bc-state';
import { MapLayersReducer } from 'react-geo-bc-state';
import { ActiveModulesReducer } from 'react-geo-bc-state';

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
