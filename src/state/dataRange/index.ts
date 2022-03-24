import {
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';

import { Moment } from 'moment';

import OlLayerBase from 'ol/layer/Base';

export interface DataRange {
  startDate: Moment;
  endDate: Moment;
  timeInterval: string;
  timeLayer: OlLayerBase;
};

const initialState: DataRange = {
  startDate: null,
  endDate: null,
  timeInterval: null,
  timeLayer: null
};

const slice = createSlice({
  name: 'dataRange',
  initialState,
  reducers: {
    setStartDate(state, action: PayloadAction<Moment>) {
      state.startDate = action.payload;
    },
    setEndDate(state, action: PayloadAction<Moment>) {
      state.endDate = action.payload;
    },
    setTimeInterval(state, action: PayloadAction<string>) {
      state.timeInterval = action.payload;
    },
    setSelectedTimeLayer(state, action: PayloadAction<OlLayerBase>) {
      state.timeLayer = action.payload;
    }
  }
});

export const {
  setStartDate,
  setEndDate,
  setTimeInterval,
  setSelectedTimeLayer
} = slice.actions;

export default slice.reducer;
