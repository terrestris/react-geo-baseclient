import moment from 'moment';

import {
  SET_START_DATE,
  SET_END_DATE,
  SET_TIME_INTERVAL,
  SET_SELECTED_TIME_LAYER
} from '../constants/DataRange';

/**
 * Sets the set startDate value
 *
 * @param {moment.Moment} startDate
 */
export function setStartDate(startDate: moment.Moment) {
  return {
    type: SET_START_DATE,
    startDate
  };
}

/**
 * Sets the set endDate value
 *
 * @param {moment.Moment} endDate
 */
export function setEndDate(endDate: moment.Moment) {
  return {
    type: SET_END_DATE,
    endDate
  };
}

/**
 * Sets the time interval of a layer
 * @param {any}  timeInterval
 */
export function setTimeInterval(timeInterval: any) {
  return {
    type: SET_TIME_INTERVAL,
    timeInterval
  };
}

/**
 * Sets the selected ol time layer
 * @param {any}  timeLayer
 */
export function setSelectedTimeLayer(timeLayer: any) {
  return {
    type: SET_SELECTED_TIME_LAYER,
    timeLayer
  };
}
