import {
  ADD_APPINFO,
} from '../actions/ApplicationInfoAction';

const initialState = {
  name: '',
  versionNumber: ''
};

/**
 * handleApplicationInfo - Reducer
 * Handles additions of application information
 *
 * @param {Object} [loadingQueue=Object] current loading queue (or initialState)
 * if empty
 * @param {Object}    action Object representing the loading action
 *
 * @return {Object} updated loading queue
 */
function handleApplicationInfo(appInfo = initialState, action) {
  switch (action.type) {
    case ADD_APPINFO: {
      return Object.assign({}, appInfo, {
        name: action.name,
        versionNumber: action.versionNumber
      });
    }
    default:
      return appInfo;
  }
}

export default handleApplicationInfo;
