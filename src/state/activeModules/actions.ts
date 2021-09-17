import {
  createAction,
  createAsyncThunk
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

const addUniqueActiveModule = createAction<any>('activeModules/add');
const removeActiveModuleByIndex = createAction<number>('activeModules/removeByIndex');
export const setInitiallyActiveModule = createAction<number>('activeModules/setInitiallyActive');

export const addActiveModule = createAsyncThunk('activeModules/addActive',
  async (activeModule: Module, thunkAPI) => {
    const activeModules: Module[] = (thunkAPI.getState() as BaseClientState).activeModules;
    const containsModule = activeModules.some((module: any) => module.name === activeModule.name);

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
      activeModuleIdx = activeModules.findIndex((module: any) => module.name === activeModule);
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
