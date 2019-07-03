import {
  HIDE_ADDLAYERWINDOW,
  SHOW_ADDLAYERWINDOW,
  TOGGLE_ADDLAYERWINDOW
} from '../constants/AppState';

import initialState from '../initialState';

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
export function reduce(appState = initialState.appState, action: any) {
  switch (action.type) {
    case TOGGLE_ADDLAYERWINDOW: {
      return Object.assign({}, appState, {
        addLayerWindowVisible: !appState.addLayerWindowVisible
      });
    }
    case SHOW_ADDLAYERWINDOW: {
      return Object.assign({}, appState, {
        addLayerWindowVisible: true
      });
    }
    case HIDE_ADDLAYERWINDOW: {
      return Object.assign({}, appState, {
        addLayerWindowVisible: false
      });
    }
    default:
      return appState;
  }
}

export default reduce;
