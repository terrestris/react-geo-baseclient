import {
  ADD_LAYERS,
  CHANGE_LAYER_VISIBILITY,
  REMOVE_LAYERS,
  SET_LAYERS,
  UPDATE_LAYER_ORDERING
} from '../constants/MapLayerChange';

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
export function removeLayers(layers: any) {
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
