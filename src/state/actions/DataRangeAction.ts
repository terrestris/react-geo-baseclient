import moment from 'moment';

import {
  SET_START_DATE,
  SET_END_DATE
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

