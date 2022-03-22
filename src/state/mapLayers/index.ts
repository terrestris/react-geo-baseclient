import {
  createSlice
} from '@reduxjs/toolkit';

import OlLayerGroup from 'ol/layer/Group';

const initialState: OlLayerGroup = null;

const slice = createSlice({
  name: 'mapView',
  initialState,
  reducers: {}
});

export default slice.reducer;
