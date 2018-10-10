/*eslint-env jest*/
import sinon from 'sinon';

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
    const dispatch = sinon.spy();
    const activeModule = {
      name: 'shinjiKagawaModule'
    };
    const expectedAction = {
      type: actions.ADD_ACTIVEMODULE,
      activeModule
    };

    actions.addActiveModule(activeModule)(dispatch, getState);

    expect(dispatch.calledOnce).toBe(true);
    expect(dispatch.calledWith(expectedAction)).toBe(true);
  });

  it ('doesn\'t dispatch the addUniqueActiveModule action if the activeModule already exists in the state', () => {
    /* eslint-disable require-jsdoc */
    const getState = () => ({activeModules: [{
      name: 'shinjiKagawaModule'
    }]});
    /* eslint-enable require-jsdoc */
    const dispatch = sinon.spy();
    const activeModule = {
      name: 'shinjiKagawaModule'
    };

    actions.addActiveModule(activeModule)(dispatch, getState);

    expect(dispatch.calledOnce).toBe(false);
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
    const dispatch = sinon.spy();
    const activeModuleIdx = 0;
    const expectedAction = {
      type: actions.REMOVE_ACTIVEMODULE,
      activeModuleIdx
    };

    // 1. Input type object.
    actions.removeActiveModule(activeModuleObj)(dispatch, getState);

    expect(dispatch.calledOnce).toBe(true);
    expect(dispatch.calledWith(expectedAction)).toBe(true);

    dispatch.reset();

    // 2. Input type string.
    actions.removeActiveModule(moduleName)(dispatch, getState);

    expect(dispatch.calledOnce).toBe(true);
    expect(dispatch.calledWith(expectedAction)).toBe(true);

    dispatch.reset();

    // 3. Input type number.
    actions.removeActiveModule(activeModuleIdx)(dispatch, getState);

    expect(dispatch.calledOnce).toBe(true);
    expect(dispatch.calledWith(expectedAction)).toBe(true);
  });

  it ('doesn\'t dispatch the removeActiveModule action if invalid input or index could not be found', () => {
    const moduleName = 'shinjiKagawaModule';
    const activeModuleObj = {
      name: moduleName
    };
    /* eslint-disable require-jsdoc */
    const getState = () => ({activeModules: [activeModuleObj]});
    /* eslint-enable require-jsdoc */
    const dispatch = sinon.spy();

    // 1. Invalid input (not of type object, string or number).
    actions.removeActiveModule(true)(dispatch, getState);

    expect(dispatch.calledOnce).toBe(false);

    dispatch.reset();

    // 2. Index could not be found (module doesn't exist).
    actions.removeActiveModule(`09_${moduleName}`)(dispatch, getState);

    expect(dispatch.calledOnce).toBe(false);
  });

});
