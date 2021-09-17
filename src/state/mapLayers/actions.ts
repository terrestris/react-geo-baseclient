import { createAction } from '@reduxjs/toolkit';

import OlLayerBase from 'ol/layer/Base';

export const setLayers = createAction<OlLayerBase[]>('mapLayers/set');
export const addLayers = createAction<OlLayerBase[]>('mapLayers/add');
export const removeLayers = createAction<OlLayerBase[]>('mapLayers/remove');
export const updateLayerOrder = createAction<OlLayerBase[]>('mapLayers/updateOrder');
export const changeLayerVisibility = createAction(
  'mapLayers/changeVisbility',
  (shogunLayerId: number, visibility: boolean) => ({
    payload: {
      shogunLayerId,
      visibility
    }
  })
);
