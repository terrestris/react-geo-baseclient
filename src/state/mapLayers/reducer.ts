import { createReducer } from '@reduxjs/toolkit';

import remove from 'lodash/remove';

import OlLayerBase from 'ol/layer/Base';

import {
  setLayers,
  addLayers,
  removeLayers,
  changeLayerVisibility,
  updateLayerOrder
} from './actions';

const initialState: OlLayerBase[] = [];

const reduce = createReducer(initialState, builder =>
  builder
    .addCase(setLayers, (state, action) => {
      return action.payload;
    })
    .addCase(addLayers, (state, action) => {
      state.push(...action.payload);
      return state;
    })
    .addCase(removeLayers, (state, action) => {
      const idsToRemove = action.payload.map((olLayer: OlLayerBase) => olLayer.get('shogunId'));

      return remove(state, (layer: OlLayerBase) => {
        return !idsToRemove.includes(layer.get('id'));
      });
    })
    .addCase(updateLayerOrder, (state, action) => {
      const orderedLayers: OlLayerBase[] = [];

      action.payload.forEach((layer: OlLayerBase) => {
        state.forEach((ml: OlLayerBase) => {
          if (ml.get('id') === layer.get('shogunId')) {
            orderedLayers.push(ml);
          }
        });
      });

      return orderedLayers.reverse();
    })
    .addCase(changeLayerVisibility, (state, action) => {
      return state.map((ml: OlLayerBase) => {
        if (ml.get('id') === action.payload.shogunLayerId) {
          ml.get('appearance').visible = action.payload.visibility;
        }
        return ml;
      });
    })
);

export default reduce;
