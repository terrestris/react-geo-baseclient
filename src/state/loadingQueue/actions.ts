import { createAction } from '@reduxjs/toolkit';

export interface LoadingQueue {
  queue: string[];
  loading: boolean;
};

export const enableLoading = createAction<string>('loading/enable');
export const disableLoading = createAction<string>('loading/disable');
