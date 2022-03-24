import {
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';

import union from 'lodash/union';
import without from 'lodash/without';

export interface LoadingQueue {
  queue: string[];
  loading: boolean;
};

const initialState: LoadingQueue = {
  queue: [],
  loading: false
};

const slice = createSlice({
  name: 'loadingQueue',
  initialState,
  reducers: {
    enableLoading(state, action: PayloadAction<string[]>) {
      state.loading = true;
      state.queue = union(state.queue, action.payload);
    },
    disableLoading(state, action: PayloadAction<string[]>) {
      state.loading = (state.queue.length - 1) !== 0;
      state.queue = without(state.queue, ...action.payload);
    }
  }
});

export const {
  enableLoading,
  disableLoading
} = slice.actions;

export default slice.reducer;
