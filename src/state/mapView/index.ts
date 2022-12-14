import {
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';

import { Coordinate } from 'ol/coordinate';

import { MapUtil } from '@terrestris/ol-util/dist/MapUtil/MapUtil';

export interface MapView {
  center: Coordinate;
  zoom: number;
  projection: string;
  resolutions: number[];
  mapExtent: [number, number, number, number];
};

const initialState: MapView = {
  center: [0, 0],
  zoom: 0,
  projection: 'EPSG:3857',
  resolutions: [],
  mapExtent: [0, 0, 0, 0]
};

const slice = createSlice({
  name: 'mapView',
  initialState,
  reducers: {
    setCenter(state, action: PayloadAction<Coordinate>) {
      state.center = action.payload;
    },
    setZoom(state, action: PayloadAction<number>) {
      state.zoom = action.payload;
    },
    setProjection(state, action: PayloadAction<string>) {
      state.projection = action.payload;
    },
    setScale(state, action: PayloadAction<number>) {
      state.zoom = MapUtil.getZoomForScale(action.payload, state.resolutions);
    },
    zoomIn(state) {
      state.zoom = (state.zoom + 1) < state.resolutions.length ?
        state.zoom + 1 :
        state.resolutions.length - 1;
    },
    zoomOut(state) {
      state.zoom = (state.zoom - 1) >= 0 ?
        state.zoom - 1 :
        0;
    }
  }
});

export const {
  setCenter,
  setZoom,
  setProjection,
  setScale,
  zoomIn,
  zoomOut
} = slice.actions;

export default slice.reducer;
