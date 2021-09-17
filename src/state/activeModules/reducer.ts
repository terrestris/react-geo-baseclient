import { createReducer } from '@reduxjs/toolkit';

import {
  addActiveModule,
  Module,
  removeActiveModule
} from './actions';

const initialState: Module[] = [];

const reduce = createReducer(initialState, builder =>
  builder
    .addCase(addActiveModule.fulfilled, (state, action) => {
      state.push(action.payload.payload);

      return state;
    })
    .addCase(removeActiveModule.fulfilled, (state, action) => {
      if (action.payload.payload > -1) {
        state.splice(action.payload.payload, 1);

        return state;
      } else {
        return state;
      }
    })
);

export default reduce;
