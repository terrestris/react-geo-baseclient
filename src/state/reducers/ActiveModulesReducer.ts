import {
  ADD_ACTIVEMODULE,
  REMOVE_ACTIVEMODULE
} from '../constants/ActiveModules';

/**
 * Handles the requested changes in the activeModules section of the state.
 *
 * @param {Object} activeModules The current state of activeModules.
 * @param {Object} action The action object.
 * @return {Object} The new state.
 */
export function reduce(activeModules: object[] = [], action: any) {
  switch (action.type) {
    case ADD_ACTIVEMODULE: {
      // Create a copy of the existing array of activeTools.
      const activeModulesCopy = Array.from(activeModules);
      // And add the new one.
      activeModulesCopy.push(action.activeModule);

      return activeModulesCopy;
    }
    case REMOVE_ACTIVEMODULE: {
      if (action.activeModuleIdx > -1) {
        // Create a copy of the existing array of activeTools.
        const activeModulesCopy = Array.from(activeModules);
        // And remove the provided one.
        activeModulesCopy.splice(action.activeModuleIdx, 1);

        return activeModulesCopy;
      } else {
        return activeModules;
      }
    }
    default:
      return activeModules;
  }
}

export default reduce;
