/* eslint-env jest*/
import * as actions from './DataRangeAction';
import moment from 'moment';
import {
  SET_START_DATE,
  SET_END_DATE
} from '../constants/DataRange';


describe('DataRangeAction', () => {

  it('it should dispatch an action on start date change', () => {
    const startDate = moment(moment.now());
    const expectedAction = {
      type: SET_START_DATE,
      startDate
    };
    expect(actions.setStartDate(startDate)).toEqual(expectedAction);
  });

  it('it should dispatch an action on end date change', () => {
    const endDate = moment(moment.now());
    const expectedAction = {
      type: SET_END_DATE,
      endDate
    };
    expect(actions.setEndDate(endDate)).toEqual(expectedAction);
  });
});
