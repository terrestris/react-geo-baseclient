/*eslint-env jest*/
import * as actions from '../../src/actions/ActiveModulesAction';

describe('ActiveModulesAction', () => {

  it ('addActiveModule returns an action creator function', () => {
    const activeModule = {
      name: 'shinjiKagawaModule'
    };

    expect(actions.addActiveModule(activeModule)).toBeInstanceOf(Function);
  });

  it ('dispatches the addUniqueActiveModule action', () => {
    /* eslint-disable require-jsdoc */
    const getState = () => ({activeModules: []});
    /* eslint-enable require-jsdoc */
    const dispatch = jest.fn();
    const activeModule = {
      name: 'shinjiKagawaModule'
    };
    const expectedAction = {
      type: actions.ADD_ACTIVEMODULE,
      activeModule
    };

    actions.addActiveModule(activeModule)(dispatch, getState);

    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0][0]).toEqual(expectedAction);
  });

  it ('doesn\'t dispatch the addUniqueActiveModule action if the activeModule already exists in the state', () => {
    /* eslint-disable require-jsdoc */
    const getState = () => ({activeModules: [{
      name: 'shinjiKagawaModule'
    }]});
    /* eslint-enable require-jsdoc */
    const dispatch = jest.fn();
    const activeModule = {
      name: 'shinjiKagawaModule'
    };

    actions.addActiveModule(activeModule)(dispatch, getState);

    expect(dispatch.mock.calls.length).toBe(0);
  });

  it ('removeActiveModule returns an action creator function', () => {
    const activeModule = {
      name: 'shinjiKagawaModule'
    };

    expect(actions.removeActiveModule(activeModule)).toBeInstanceOf(Function);
  });

  it ('dispatches the removeActiveModule action', () => {
    const moduleName = 'shinjiKagawaModule';
    const activeModuleObj = {
      name: moduleName
    };
    /* eslint-disable require-jsdoc */
    const getState = () => ({activeModules: [activeModuleObj]});
    /* eslint-enable require-jsdoc */
    const dispatch = jest.fn();
    const activeModuleIdx = 0;
    const expectedAction = {
      type: actions.REMOVE_ACTIVEMODULE,
      activeModuleIdx
    };

    // 1. Input type object.
    actions.removeActiveModule(activeModuleObj)(dispatch, getState);

    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0][0]).toEqual(expectedAction);

    dispatch.mockReset();

    // 2. Input type string.
    actions.removeActiveModule(moduleName)(dispatch, getState);

    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0][0]).toEqual(expectedAction);

    dispatch.mockReset();

    // 3. Input type number.
    actions.removeActiveModule(activeModuleIdx)(dispatch, getState);

    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0][0]).toEqual(expectedAction);
  });

  it ('doesn\'t dispatch the removeActiveModule action if invalid input or index could not be found', () => {
    const moduleName = 'shinjiKagawaModule';
    const activeModuleObj = {
      name: moduleName
    };
    /* eslint-disable require-jsdoc */
    const getState = () => ({activeModules: [activeModuleObj]});
    /* eslint-enable require-jsdoc */
    const dispatch = jest.fn();

    // 1. Invalid input (not of type object, string or number).
    actions.removeActiveModule(true)(dispatch, getState);

    expect(dispatch.mock.calls.length).toBe(0);

    dispatch.mockReset();

    // 2. Index could not be found (module doesn't exist).
    actions.removeActiveModule(`09_${moduleName}`)(dispatch, getState);

    expect(dispatch.mock.calls.length).toBe(0);
  });

});