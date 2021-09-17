import { createReducer } from '@reduxjs/toolkit';

import union from 'lodash/union';
import without from 'lodash/without';

import {
  enableLoading,
  disableLoading,
  LoadingQueue
} from './actions';

const initialState: LoadingQueue = {
  queue: [],
  loading: false
};

const reduce = createReducer(initialState, builder =>
  builder
    .addCase(enableLoading, (state, action) => {
      state.loading = true;
      state.queue = union(state.queue, action.payload);

      return state;
    })
    .addCase(disableLoading, (state, action) => {
      state.loading = (state.queue.length - 1) !== 0;
      state.queue = without(state.queue, action.payload);

      return state;
    })
);

export default reduce;
