import { isString } from 'lodash/isString';
import { isNumber } from 'lodash/isNumber';
import { isObject } from 'lodash/isObject';
import Logger from '@terrestris/base-util';

/**
 * Action types
 */
export const ADD_ACTIVEMODULE = 'ADD_ACTIVEMODULE';
export const REMOVE_ACTIVEMODULE = 'REMOVE_ACTIVEMODULE';
export const SET_INITIALLY_ACTIVE_MODULE = 'SET_INITIALLY_ACTIVE_MODULE';

/**
 * Returns the ADD_ACTIVEMODULE action.
 *
 * Note: This is a private method that should be called by the public
 * `addActiveModule()`` method only.
 *
 * @param {Object} activeModule The (unique) module to add to the active
 *                              modules state.
 * @return {Object} The ADD_ACTIVEMODULE action.
 */
function addUniqueActiveModule(activeModule) {
  return {
    type: ADD_ACTIVEMODULE,
    activeModule
  };
}

/**
 * Returns the REMOVE_ACTIVEMODULE action.
 *
 * Note: This is a private method that should be called by the public
 * `removeActiveModule()`` method only.
 *
 * @param {Number} activeModuleIdx The index of the active module to delete.
 * @return {Object} The REMOVE_ACTIVEMODULE action.
 */
function removeActiveModuleByIndex(activeModuleIdx) {
  return {
    type: REMOVE_ACTIVEMODULE,
    activeModuleIdx
  };
}

/**
 * Dispatches the ADD_ACTIVEMODULE, but only if the provided activeModule
 * isn't available in the state already.
 *
 * @param {Object} activeModule The module to add to the active modules state.
 */
export function addActiveModule(activeModule) {
  return function(dispatch, getState) {
    const activeModules = getState().activeModules;
    let containsModule = activeModules.some(module => module.name === activeModule.name);

    if (containsModule) {
      Logger.debug('Active module already exists in state.');
      return;
    }

    dispatch(addUniqueActiveModule(activeModule));
  };
}

/**
 * Dispatches the REMOVE_ACTIVEMODULE, but only if the provided activeModule
 * could be found in the state.
 *
 * @param {String|Number|Object} activeModule The activeModule to remove.
 *                                            Possible input values are the
 *                                            name, index or full object of the
 *                                            module to remove.
 */
export function removeActiveModule(activeModule) {
  return function(dispatch, getState) {
    const activeModules = getState().activeModules;
    let activeModuleIdx;

    if (isString(activeModule)) {
      activeModuleIdx = activeModules.findIndex(module => module.name === activeModule);
    } else if (isNumber(activeModule)) {
      activeModuleIdx = activeModule;
    } else if (isObject(activeModule)) {
      activeModuleIdx = activeModules.indexOf(activeModule);
    } else {
      Logger.debug('Invalid input type given.');
      return;
    }

    if (activeModuleIdx === -1) {
      Logger.debug('Could not find the provided activeModule in state.');
      return;
    }

    dispatch(removeActiveModuleByIndex(activeModuleIdx));
  };
}

/**
 * Returns the SET_INITIALLY_ACTIVE_MODULE action.
 * *
 * @param {Number} initiallyActiveModuleIdx The index of the active module to set active initially
 * @return {Object} The REMOVE_ACTIVEMODULE action.
 */
export function setInitiallyActiveModule(initiallyActiveModuleIdx) {
  return {
    type: SET_INITIALLY_ACTIVE_MODULE,
    initiallyActiveModuleIdx
  };
}
