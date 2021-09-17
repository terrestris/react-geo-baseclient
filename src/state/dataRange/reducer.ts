import { createReducer } from '@reduxjs/toolkit';

import {
  setStartDate,
  setEndDate,
  setTimeInterval,
  setSelectedTimeLayer,
  DataRange
} from './actions';

const initialState: DataRange = {
  startDate: null,
  endDate: null,
  timeInterval: null,
  timeLayer: null
};

const reduce = createReducer(initialState, builder =>
  builder
    .addCase(setStartDate, (state, action) => {
      state.startDate = action.payload;
      return state;
    })
    .addCase(setEndDate, (state, action) => {
      state.endDate = action.payload;
      return state;
    })
    .addCase(setTimeInterval, (state, action) => {
      state.timeInterval = action.payload;
      return state;
    })
    .addCase(setSelectedTimeLayer, (state, action) => {
      state.timeLayer = action.payload;
      return state;
    })
);

export default reduce;
