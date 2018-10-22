import {
  DISABLE_LOADING,
  ENABLE_LOADING
} from '../constants/Loading';

/**
 * disableLoading - Action
 *
 * @param {String} key key of the tile, request that should be removed
 * from the loading queue
 *
 * @return {Object} disableLoading - action object
 */
export function disableLoading(key: string) {
  return {
    type: DISABLE_LOADING,
    key
  };
}

/**
 * enableLoading - Action
 *
 * @param {String} key key of the tile, request that should be added
 * to the loading queue
 *
 * @return {Object} enableLoading - action object
 */
export function enableLoading(key: string) {
  return {
    type: ENABLE_LOADING,
    key
  };
}
