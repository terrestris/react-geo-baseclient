/**
 * Action types
 */
export const ENABLE_LOADING = 'ENABLE_LOADING';
export const DISABLE_LOADING = 'DISABLE_LOADING';

// Action creators


/**
 * disableLoading - Action
 *
 * @param {String} key key of the tile, request that should be removed
 * from the loading queue
 *
 * @return {Object} disableLoading - action object
 */
export function disableLoading(key) {
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
export function enableLoading(key) {
  return {
    type: ENABLE_LOADING,
    key
  };
}
