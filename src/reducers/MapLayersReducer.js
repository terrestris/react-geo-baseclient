import {
  SET_LAYERS,
  ADD_LAYERS,
  REMOVE_LAYERS,
  CHANGE_LAYER_VISIBILITY,
  UPDATE_LAYER_ORDERING
} from '../actions/MapLayerChangeAction';

import { remove } from 'lodash';

const initialState = [];

/**
 * Handles the mapLayerChangeActions.
 *
 * @param {Object} [mapLayers=initialState] The mapLayers as they are currently
 *                                          in the redux state.
 * @param {Object} action Containts the action information.
 * @return {Object} The mapLayers as they should be in the state afterwards.
 */
function handleMapLayerChange(mapLayers = initialState, action) {
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
      const orderedLayers = [];
      action.mapLayers.forEach((layer) => {
        mapLayers.forEach((ml) => {
          if (ml.id === layer.get('shogunId')) {
            orderedLayers.push(ml);
            return false;
          }
        });
      });
      return orderedLayers.reverse();
    }
    case REMOVE_LAYERS: {
      const idsToRemove = action.layers.map((olLayer) => olLayer.get('shogunId'));
      return remove(mapLayers, (layer) => {
        return !idsToRemove.includes(layer.id);
      });
    }
    default:
      return mapLayers;
  }
}

export default handleMapLayerChange;
