import {
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';

import remove from 'lodash/remove';

import OlLayerBase from 'ol/layer/Base';

interface LayerVisibility {
  shogunLayerId: number;
  visibility: boolean;
}

const initialState: OlLayerBase[] = [];

const slice = createSlice({
  name: 'mapView',
  initialState,
  reducers: {
    setLayers(state, action: PayloadAction<OlLayerBase[]>) {
      state = action.payload;
    },
    addLayers(state, action: PayloadAction<OlLayerBase[]>) {
      state.push(...action.payload);
    },
    removeLayers(state, action: PayloadAction<OlLayerBase[]>) {
      const idsToRemove = action.payload.map((olLayer: OlLayerBase) => olLayer.get('shogunId'));

      state = remove(state, (layer: OlLayerBase) => !idsToRemove.includes(layer.get('id')));
    },
    updateLayerOrder(state, action: PayloadAction<OlLayerBase[]>) {
      const orderedLayers: OlLayerBase[] = [];

      action.payload.forEach((layer: OlLayerBase) => {
        state.forEach((ml: OlLayerBase) => {
          if (ml.get('id') === layer.get('shogunId')) {
            orderedLayers.push(ml);
          }
        });
      });

      state = orderedLayers.reverse();
    },
    changeLayerVisibility(state, action: PayloadAction<LayerVisibility>) {
      return state.map((ml: OlLayerBase) => {
        if (ml.get('id') === action.payload.shogunLayerId) {
          ml.get('appearance').visible = action.payload.visibility;
        }
        return ml;
      });
    }
  }
});

export const {
  setLayers,
  addLayers,
  removeLayers,
  updateLayerOrder,
  changeLayerVisibility
} = slice.actions;

export default slice.reducer;
