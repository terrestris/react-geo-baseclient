import {
  SET_START_DATE,
  SET_END_DATE,
  SET_TIME_INTERVAL,
  SET_SELECTED_TIME_LAYER
} from '../constants/DataRange';

const initialState: any = {};

/**
 */
function setDataRange(dataRange = initialState, action: any) {
  switch (action.type) {
    case SET_START_DATE: {
      return { ...dataRange, startDate: action.startDate };
    }
    case SET_END_DATE: {
      return { ...dataRange, endDate: action.endDate };
    }
    case SET_TIME_INTERVAL: {
      return {... dataRange, timeInterval: action.timeInterval};
    }
    case SET_SELECTED_TIME_LAYER: {
      return {... dataRange, timeLayer: action.timeLayer};
    }
    default:
      return dataRange;
  }
}

export default setDataRange;
