import {
  ADD_APPINFO
} from '../constants/ApplicationInfo';

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
export function reduce(appInfo = initialState, action: any) {
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

export default reduce;
