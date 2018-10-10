import undoable from 'redux-undo';
import {
  SET_CENTER,
  SET_ZOOM,
  SET_SCALE,
  SET_MAPVIEW,
  ZOOM_IN,
  ZOOM_OUT
} from '../actions/MapViewChangeAction';
import { METERS_PER_UNIT } from 'ol/proj';
import { findIndex, isEqual } from 'lodash';

/**
 * Returns the appropriate scale for the given resolution and units.
 *
 * @method
 * @param {Number} resolution The resolutions to calculate the scale for.
 * @param {String} units The units the resolution is based on, typically
 *                       either 'm' or 'degrees'.
 * @return {Number} The appropriate scale.
 */
// function getScaleForResolution(resolution, units) {
//   let dpi = 25.4 / 0.28;
//   let mpu = METERS_PER_UNIT.METERS_PER_UNIT[units];
//   let inchesPerMeter = 39.37;
//
//   return parseFloat(resolution) * mpu * inchesPerMeter * dpi;
// }

// TODO: use real utils!

/**
 * Calculates the appropriate map resolution for a given scale in the given
 * units.
 *
 * See: https://gis.stackexchange.com/questions/158435/
 * how-to-get-current-scale-in-openlayers-3
 *
 * @method
 * @param {Number} scale The input scale to calculate the appropriate
 *                       resolution for.
 * @param {String} units The units to use for calculation (m or degrees).
 * @return {Number} The calculated resolution.
 */
function getResolutionForScale(scale, units) {
  let dpi = 25.4 / 0.28;
  let mpu = METERS_PER_UNIT[units];
  let inchesPerMeter = 39.37;

  return parseFloat(scale) / (mpu * inchesPerMeter * dpi);
}

/**
 * Determine zoom level for given scale
 *
 * @param {Number} scale       map scale
 * @param {Array} resolutions resolutions array
 *
 * @return {Number} zoom level
 */
function getZoomForScale(scale, resolutions) {
  if (Number.isNaN(Number(scale))) {
    return 0;
  }

  if (scale < 0) {
    return 0;
  }

  if (scale === 0) {
    return resolutions.length - 1;
  }

  let calculatedResolution = getResolutionForScale(scale, 'm'); // TODO
  let closestVal = resolutions.reduce((prev, curr) => {
    let res = Math.abs(curr - calculatedResolution) < Math.abs(prev - calculatedResolution)
      ? curr
      : prev;
    return res;
  });
  let index = findIndex(resolutions, function(o) {
    return Math.abs(o - closestVal) <= 1e-1;
  });

  return index;
}

const initialState = {};

/**
 * mapViewChange - reducer
 */
export function mapViewChange(mapViewState = initialState, action) {
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
          : getZoomForScale(action.scale, mapViewState.resolutions)
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

export default undoable(mapViewChange);
