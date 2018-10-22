import {
  ADD_APPINFO
} from '../constants/ApplicationInfo';

/**
 * addAppInfo - Action
 *
 * @param {type} appInfoObj Object containing the application information
 *
 * @return {Object} addAppInfo - action object
 */
export function addAppInfo(appInfoObj: any) {
  return {
    type: ADD_APPINFO,
    appInfoObj
  };
}
