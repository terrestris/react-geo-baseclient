/*eslint-env jest*/
import reducer from '../../src/reducers/ActiveModulesReducer';
import * as actions from '../../src/actions/ActiveModulesAction';

const initialState = [];

describe('ActiveModulesReducer', () => {

  it('returns the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('handles ADD_ACTIVEMODULE', () => {
    const activeModule = [{
      name: 'shinjiKagawaModule'
    }];
    const action = {
      type: actions.ADD_ACTIVEMODULE,
      activeModule
    };
    const expectedState = [activeModule];

    expect(reducer([], action)).toEqual(expectedState);
  });

  it('handles REMOVE_ACTIVEMODULE', () => {
    const activeModuleIdx = 0;
    const activeModules = [{
      name: 'shinjiKagawaModule'
    }];
    const action = {
      type: actions.REMOVE_ACTIVEMODULE,
      activeModuleIdx
    };
    const expectedState = [];

    expect(reducer(activeModules, action)).toEqual(expectedState);
  });

});
