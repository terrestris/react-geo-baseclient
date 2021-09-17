import {
  createAction,
  createAsyncThunk
} from '@reduxjs/toolkit';

import { MapUtil } from '@terrestris/ol-util/src/MapUtil/MapUtil';

import { BaseClientState } from '../reducer';

export interface MapView {
  center: [number, number];
  zoom: number;
  projection: string;
  resolutions: number[];
  mapExtent: [number, number, number, number];
};

export const setCenter = createAction<[number, number]>('mapView/center/set');
export const setProjection = createAction<string>('mapView/projection/set');
export const setZoom = createAction<number>('mapView/zoom/set');

export const setScale = createAsyncThunk('mapView/scale/set',
  async (scale: number, thunkAPI) => {
    const resolutions: number[] = ((thunkAPI.getState() as BaseClientState).mapView as MapView).resolutions;

    const zoom: number = MapUtil.getZoomForScale(scale, resolutions);

    return zoom;
  }
);

export const zoomIn = createAsyncThunk('mapView/zoom/in',
  async (scale: number, thunkAPI) => {
    const resolutions: number[] = ((thunkAPI.getState() as BaseClientState).mapView as MapView).resolutions;
    const zoom: number = ((thunkAPI.getState() as BaseClientState).mapView as MapView).zoom;

    return (zoom + 1) < resolutions.length ? zoom + 1 : resolutions.length - 1;
  }
);

export const zoomOut = createAsyncThunk('mapView/zoom/out',
  async (scale: number, thunkAPI) => {
    const zoom: number = ((thunkAPI.getState() as BaseClientState).mapView as MapView).zoom;

    return (zoom - 1) >= 0 ? zoom - 1 : 0;
  }
);
