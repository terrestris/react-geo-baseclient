import { createReducer } from '@reduxjs/toolkit';

import {
  addAppInfo,
  AppInfo
} from './actions';

const initialState: AppInfo = {
  name: '',
  versionNumber: ''
};

const reduce = createReducer(initialState, builder =>
  builder
    .addCase(addAppInfo, (state, action) => {
      return action.payload;
    })
);

export default reduce;
