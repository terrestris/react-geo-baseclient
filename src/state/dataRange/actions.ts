import { createAction } from '@reduxjs/toolkit';

import { Moment } from 'moment';

import OlLayerBase from 'ol/layer/Base';

export interface DataRange {
  startDate: Moment;
  endDate: Moment;
  timeInterval: string;
  timeLayer: OlLayerBase;
};

export const setStartDate = createAction<Moment>('dataRange/setStartDate');
export const setEndDate = createAction<Moment>('dataRange/setEndDate');
export const setTimeInterval = createAction<string>('dataRange/setTimeInterval');
export const setSelectedTimeLayer = createAction<OlLayerBase>('dataRange/setSelectedTimeLayer');
