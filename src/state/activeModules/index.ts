import {
  createSlice,
  createAsyncThunk,
  PayloadAction
} from '@reduxjs/toolkit';

import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isObject from 'lodash/isObject';

import Logger from '@terrestris/base-util/dist/Logger';

import { BaseClientState } from '../reducer';

export interface Module {
  name: string;
  xtype: string;
  hidden: boolean;
  properties: any;
};

const initialState: Module[] = [];

export const addActiveModule = createAsyncThunk('activeModules/addActive',
  async (activeModule: Module, thunkAPI) => {
    const activeModules: Module[] = (thunkAPI.getState() as BaseClientState).activeModules;
    const containsModule = activeModules.some((module) => module.name === activeModule.name);

    if (containsModule) {
      Logger.debug('Active module already exists in state.');
      return;
    }

    return thunkAPI.dispatch(addUniqueActiveModule(activeModule));
  }
);

export const removeActiveModule = createAsyncThunk('activeModules/removeActive',
  async (activeModule: Module, thunkAPI) => {
    const activeModules: Module[] = (thunkAPI.getState() as BaseClientState).activeModules;
    let activeModuleIdx;

    if (isString(activeModule)) {
      activeModuleIdx = activeModules.findIndex((module) => module.name === activeModule);
    } else if (isNumber(activeModule)) {
      activeModuleIdx = activeModule;
    } else if (isObject(activeModule)) {
      activeModuleIdx = activeModules.indexOf(activeModule);
    } else {
      Logger.debug('Invalid input type given.');
      return;
    }

    if (activeModuleIdx === -1) {
      Logger.debug('Could not find the provided activeModule in state.');
      return;
    }

    return thunkAPI.dispatch(removeActiveModuleByIndex(activeModuleIdx));
  }
);

const slice = createSlice({
  name: 'activeModules',
  initialState,
  reducers: {
    addUniqueActiveModule(state, action: PayloadAction<Module>) {
      state.push(action.payload);
    },
    removeActiveModuleByIndex(state, action: PayloadAction<number>) {
      state.splice(action.payload, 1);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addActiveModule.fulfilled, (state, action) => {
        state.push(action.payload.payload);
      })
      .addCase(removeActiveModule.fulfilled, (state, action) => {
        if (action.payload.payload > -1) {
          state.splice(action.payload.payload, 1);
        }
      });
  }
});

export const {
  addUniqueActiveModule,
  removeActiveModuleByIndex
} = slice.actions;

export default slice.reducer;
