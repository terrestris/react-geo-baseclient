import OlCollection from 'ol/collection';
/**
 * Action types
 */
export const SET_LAYERS = 'SET_LAYERS';
export const ADD_LAYERS = 'ADD_LAYERS';
export const REMOVE_LAYERS = 'REMOVE_LAYERS';
export const CHANGE_LAYER_VISIBILITY = 'CHANGE_LAYER_VISIBILITY';
export const UPDATE_LAYER_ORDERING = 'UPDATE_LAYER_ORDERING';

/**
 * setLayers - Description
 *
 * @param {Array} layerObjects Description
 *
 * @return {type} Description
 */
export function setLayers(layerObjects: object[]) {
  return {
    type: SET_LAYERS,
    layerObjects
  };
}

/**
 * addLayers - Description
 *
 * @param {Array} layerObjects Description
 *
 * @return {type} Description
 */
export function addLayers(layerObjects: object[]) {
  return {
    type: ADD_LAYERS,
    layerObjects
  };
}

/**
 * removeLayers - Description
 *
 * @param {Ol.Collection} layerObjects layers (OL) to remove
 *
 * @return {type} Description
 */
export function removeLayers(layers: OlCollection<[]>) {
  return {
    type: REMOVE_LAYERS,
    layers
  };
}

/**
 * changeLayerVisibility - action
 *
 * @param {Number} shogunLayerId ID of SHOGun(2) layer to change
 * @param {boolean} visibility   visibility to set
 *
 * @return {Object} The changeLayerVisibility action object.
 */
export function changeLayerVisibility(shogunLayerId: number, visibility: boolean) {
  return {
    type: CHANGE_LAYER_VISIBILITY,
    shogunLayerId,
    visibility
  };
}

/**
 * updateLayerOrdering - action
 *
 * @param {Array} mapLayers Array if layers to obtain the ordering from
 *
 * @return {Object} The updateLayerOrdering action object.
 */
export function updateLayerOrdering(mapLayers: object[]) {
  return {
    type: UPDATE_LAYER_ORDERING,
    mapLayers
  };
}
