const remove = require('lodash/remove');

import {
  SET_LAYERS,
  ADD_LAYERS,
  REMOVE_LAYERS,
  CHANGE_LAYER_VISIBILITY,
  UPDATE_LAYER_ORDERING
} from '../constants/MapLayerChange';

const initialState: any[] = [];

/**
 * Handles the mapLayerChangeActions.
 *
 * @param {Object} [mapLayers=initialState] The mapLayers as they are currently
 *                                          in the redux state.
 * @param {Object} action Containts the action information.
 * @return {Object} The mapLayers as they should be in the state afterwards.
 */
export function reduce(mapLayers = initialState, action: any) {
  switch (action.type) {
    case SET_LAYERS: {
      return action.layerObjects;
    }
    case ADD_LAYERS: {
      return [...action.layerObjects, ...mapLayers];
    }
    case CHANGE_LAYER_VISIBILITY: {
      return mapLayers.map((ml) => {
        if (ml.id === action.shogunLayerId) {
          ml.appearance.visible = action.visibility;
        }
        return ml;
      });
    }
    case UPDATE_LAYER_ORDERING: {
      const orderedLayers: any[] = [];
      action.mapLayers.forEach((layer: any) => {
        mapLayers.forEach((ml: any) => {
          if (ml.get('id') === layer.get('shogunId')) {
            orderedLayers.push(ml);
          }
        });
      });
      return orderedLayers.reverse();
    }
    case REMOVE_LAYERS: {
      const idsToRemove = action.layers.map((olLayer: any) => olLayer.get('shogunId'));
      return remove(mapLayers, (layer: any) => {
        return !idsToRemove.includes(layer.get('id'));
      });
    }
    default:
      return mapLayers;
  }
}

export default reduce;
