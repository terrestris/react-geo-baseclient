/*eslint-env jest*/
import * as actions from './LoadingAction';
import {
  ENABLE_LOADING,
  DISABLE_LOADING
} from '../constants/Loading';


describe('LoadingAction', () => {

  it ('it should dispatch an action on load start', () => {
    const key = 'Manta';
    const expectedAction = {
      type: ENABLE_LOADING,
      key
    };

    expect(actions.enableLoading(key)).toEqual(expectedAction);
  });

  it ('it should dispatch an action on load end', () => {
    const key = 'Manta';
    const expectedAction = {
      type: DISABLE_LOADING,
      key
    };

    expect(actions.disableLoading(key)).toEqual(expectedAction);
  });

});
