import moment from 'moment';

import {
  SET_START_DATE,
  SET_END_DATE
} from '../constants/DataRange';

/**
 * Sets the set startDate value
 *
 * @param {moment.Moment} date
 */
export function setStartDate(date: moment.Moment) {
  return {
    type: SET_START_DATE,
    date
  };
}

/**
 * Sets the set endDate value
 *
 * @param {moment.Moment} date
 */
export function setEndDate(date: moment.Moment) {
  return {
    type: SET_END_DATE,
    date
  };
}

