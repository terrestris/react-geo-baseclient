import { union, without } from 'lodash';

import {
  ENABLE_LOADING,
  DISABLE_LOADING
} from '../actions/LoadingAction';

const initialState = {
  queue: [],
  loading: false
};

/**
 * loadingChange - Reducer
 * Handles additions and removals to/from the loading queue
 *
 * @param {Object} [loadingQueue=Object] current loading queue (or initialState)
 * if empty
 * @param {Object}    action Object representing the loading action
 *
 * @return {Object} updated loading queue
 */
function loadingChange(loadingQueue = initialState, action) {
  switch (action.type) {
    case ENABLE_LOADING: {
      return Object.assign({}, loadingQueue, {
        'queue': Array.isArray(loadingQueue.queue) ?
          union(loadingQueue.queue, [action.key]) : [action.key],
        'loading': true
      });
    }
    case DISABLE_LOADING: {
      return Object.assign({}, loadingQueue, {
        'queue': Array.isArray(loadingQueue.queue) ?
          without(loadingQueue.queue, action.key) : [],
        'loading': Array.isArray(loadingQueue.queue) &&
          (loadingQueue.queue.length - 1) !== 0
      });
    }
    default:
      return loadingQueue;
  }
}

export default loadingChange;
