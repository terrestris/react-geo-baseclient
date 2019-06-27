import {
  SET_CENTER,
  SET_PROJECTION,
  SET_SCALE,
  SET_ZOOM,
  ZOOM_IN,
  ZOOM_OUT
} from '../constants/MapViewChange';


/**
 * setCenter - action
 *
 * @param {ol.Coordinate} center target center of the map
 *
 * @return {Object} setCenter action object
 */
export function setCenter(center: number[]) {
  return {
    type: SET_CENTER,
    center: center
  };
}

/**
 * setProjection - action
 *
 * @param {string} code projection code of the map
 *
 * @return {Object} setProjection action object
 */
export function setProjection(code: string) {
  return {
    type: SET_PROJECTION,
    projection: code
  };
}

/**
 * setZoom - action
 *
 * @param {Number} zoom target zoom level of the map
 *
 * @return {Object} setZoom action object
 */
export function setZoom(zoom: number) {
  return {
    type: SET_ZOOM,
    zoom: zoom
  };
}

/**
 * setScale - action
 *
 * @param {Number} scale target map scale
 *
 * @return {Object} setScale action object
 */
export function setScale(scale: number) {
  return {
    type: SET_SCALE,
    scale: scale
  };
}

/**
 * zoomIn - action
 *
 * @return {Object} zoomIn action object
 */
export function zoomIn() {
  return {
    type: ZOOM_IN
  };
}

/**
 * zoomOut - action
 *
 * @return {Object} zoomOut action object
 */
export function zoomOut() {
  return {
    type: ZOOM_OUT
  };
}
