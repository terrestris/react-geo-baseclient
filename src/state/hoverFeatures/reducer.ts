import { createReducer } from '@reduxjs/toolkit';

import {
  fetchFeatures,
  clearFeatures
} from './actions';

export interface Results {
  isFetching: boolean;
  features: any;
  error: string;
  lastUpdated: any;
}

const initialState: Results = {
  isFetching: false,
  features: {},
  error: '',
  lastUpdated: ''
};

const reduce = createReducer(initialState, builder =>
  builder
    .addCase(fetchFeatures.fulfilled, (state, action) => {
      state.features = action.payload;
      return state;
    })
    .addCase(clearFeatures, (state, action) => {
      state.features = [];
      return state;
    })
);

export default reduce;
