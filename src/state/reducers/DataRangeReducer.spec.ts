/* eslint-env jest*/
import reducer from './DataRangeReducer';
import moment from 'moment';
import {
  SET_START_DATE,
  SET_END_DATE
} from '../constants/DataRange';


describe('LoadingReducer', () => {

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({});
  });

  it('should handle SET_START_DATE', () => {
    const startDate = moment(moment.now());

    // test with empty initial state
    const state = {
      startDate
    };
    const defaultAction = {
      type: SET_START_DATE,
      startDate
    };

    expect(reducer({}, defaultAction)).toEqual(state);

    // test with existing state
    const changedDate = startDate.add(1, 'hours');
    const action = {
      type: SET_START_DATE,
      startDate: changedDate
    };

    expect(reducer(state, action)).toEqual({
      startDate: changedDate
    });
  });

  it('should handle SET_END_DATE', () => {
    const endDate = moment(moment.now());

    // test with empty initial state
    const state = {
      endDate
    };
    const defaultAction = {
      type: SET_END_DATE,
      endDate
    };

    expect(reducer({}, defaultAction)).toEqual(state);

    // test with existing state
    const changedDate = endDate.add(1, 'hours');
    const action = {
      type: SET_END_DATE,
      endDate: changedDate
    };

    expect(reducer(state, action)).toEqual({
      endDate: changedDate
    });
  });
});
