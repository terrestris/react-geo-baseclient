/*eslint-env jest*/
import reducer from './ActiveModulesReducer';
import {
  ADD_ACTIVEMODULE,
  REMOVE_ACTIVEMODULE
} from '../constants/ActiveModules';

const initialState: any[] = [];

describe('ActiveModulesReducer', () => {

  it('returns the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('handles ADD_ACTIVEMODULE', () => {
    const activeModule = [{
      name: 'shinjiKagawaModule'
    }];
    const action = {
      type: ADD_ACTIVEMODULE,
      activeModule
    };
    const expectedState = [activeModule];

    expect(reducer([], action)).toEqual(expectedState);
  });

  it('handles REMOVE_ACTIVEMODULE', () => {
    const activeModuleIdx = 0;
    const activeModules: object[] = [{
      name: 'shinjiKagawaModule'
    }];
    const action = {
      type: REMOVE_ACTIVEMODULE,
      activeModuleIdx
    };
    const expectedState: any[] = [];

    expect(reducer(activeModules, action)).toEqual(expectedState);
  });

});