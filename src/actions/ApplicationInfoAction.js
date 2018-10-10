/**
 * Action types
 */
export const ADD_APPINFO = 'ADD_APPINFO';

// Action creators
/**
 * addAppInfo - Action
 *
 * @param {type} appInfoObj Object containing the application information
 *
 * @return {Object} addAppInfo - action object
 */
export function addAppInfo(appInfoObj) {
  return {
    type: ADD_APPINFO,
    appInfoObj
  };
}
