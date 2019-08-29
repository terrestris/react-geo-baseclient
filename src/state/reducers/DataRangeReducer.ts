import {
  SET_START_DATE,
  SET_END_DATE
} from '../constants/DataRange';

const initialState: any = {};

/**
 */
function setDataRange(dataRange = initialState, action: any) {
  switch (action.type) {
    case SET_START_DATE: {
      return { ...dataRange, startDate: action.date };
    }
    case SET_END_DATE: {
      return { ...dataRange, endDate: action.date };
    }
    default:
      return dataRange;
  }
}

export default setDataRange;
