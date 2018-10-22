import undoable from 'redux-undo';
const isEqual = require('lodash/isEqual');
import { MapUtil } from '@terrestris/ol-util';

import {
  SET_CENTER,
  SET_ZOOM,
  SET_SCALE,
  SET_MAPVIEW,
  ZOOM_IN,
  ZOOM_OUT
} from '../constants/MapViewChange';

const initialState: any = {};

/**
 * mapViewChange - reducer
 */
export function reduce(mapViewState = initialState, action: any) {
  switch (action.type) {
    case SET_CENTER:
      return Object.assign({}, mapViewState, {
        center: action.center
      });
    case SET_ZOOM:
      return Object.assign({}, mapViewState, {
        zoom: action.zoom
      });
    case SET_SCALE:
      return Object.assign({}, mapViewState, {
        zoom: isEqual(mapViewState, initialState)
          ? 0
          : MapUtil.getZoomForScale(action.scale, mapViewState.resolutions)
      });
    case ZOOM_IN:
      return Object.assign({}, mapViewState, {
        zoom: isEqual(mapViewState, initialState)
          ? 0
          : ((mapViewState.zoom + 1) < mapViewState.resolutions.length
            ? mapViewState.zoom + 1
            : mapViewState.resolutions.length - 1)
      });
    case ZOOM_OUT:
      return Object.assign({}, mapViewState, {
        zoom: isEqual(mapViewState, initialState)
          ? 0
          : ((mapViewState.zoom - 1) >= 0
            ? mapViewState.zoom - 1
            : 0)
      });
    case SET_MAPVIEW:
      return Object.assign({}, mapViewState, {
        center: action.mapView.center,
        zoom: action.mapView.zoom
      });
    default:
      return mapViewState;
  }
}

export default undoable(reduce);
