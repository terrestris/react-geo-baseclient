import { createReducer } from '@reduxjs/toolkit';

import {
  MapView,
  setCenter,
  setProjection,
  setScale,
  setZoom,
  zoomIn,
  zoomOut
} from './actions';

const initialState: MapView = {
  center: [0, 0],
  zoom: 0,
  projection: 'EPSG:3857',
  resolutions: [],
  mapExtent: [0, 0, 0, 0]
};

const reduce = createReducer(initialState, builder =>
  builder
    .addCase(setCenter, (state, action) => {
      state.center = action.payload;

      return state;
    })
    .addCase(setZoom, (state, action) => {
      state.zoom = action.payload;

      return state;
    })
    .addCase(setProjection, (state, action) => {
      state.projection = action.payload;

      return state;
    })
    .addCase(setScale.fulfilled, (state, action) => {
      state.zoom = action.payload;

      return state;
    })
    .addCase(zoomIn.fulfilled, (state, action) => {
      state.zoom = action.payload;

      return state;
    })
    .addCase(zoomOut.fulfilled, (state, action) => {
      state.zoom = action.payload;

      return state;
    })
);

export default reduce;
