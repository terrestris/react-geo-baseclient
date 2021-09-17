import { createAction } from '@reduxjs/toolkit';

export interface AppInfo {
  name: string;
  versionNumber: string;
};

export const addAppInfo = createAction<any>('appInfo/add');
