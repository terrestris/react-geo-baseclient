import {
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';

export interface AppInfo {
  name: string;
  versionNumber: string;
};

const initialState: AppInfo = {
  name: '',
  versionNumber: ''
};

const slice = createSlice({
  name: 'appInfo',
  initialState,
  reducers: {
    addAppInfo(state, action: PayloadAction<AppInfo>) {
      return action.payload;
    }
  }
});

export const {
  addAppInfo
} = slice.actions;

export default slice.reducer;
