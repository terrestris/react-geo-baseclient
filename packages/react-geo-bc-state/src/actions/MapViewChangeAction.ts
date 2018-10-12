/**
 * Action types
 */
export const SET_CENTER = 'SET_CENTER';
export const SET_ZOOM = 'SET_ZOOM';
export const ZOOM_IN = 'ZOOM_IN';
export const ZOOM_OUT = 'ZOOM_OUT';
export const SET_MAPVIEW = 'SET_MAPVIEW';
export const SET_SCALE = 'SET_SCALE';

// Action creators

/**
 * setMapView - action
 *
 * @param {Object} mapView the mapview having center and zoom property
 *
 * @return {Object} setMapView action object
 */
export function setMapView(mapView: any) {
  return {
    type: SET_MAPVIEW,
    mapView
  };
}

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
