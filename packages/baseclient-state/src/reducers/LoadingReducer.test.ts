/*eslint-env jest*/
import reducer from './LoadingReducer';
import {
  ENABLE_LOADING,
  DISABLE_LOADING
} from '../constants/Loading';

const initialState = {
  queue: [],
  loading: false
};

describe('LoadingReducer', () => {

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle ENABLE_LOADING', () => {
    const singleLoadingState = {
      'queue': ['Test'],
      'loading': true
    };
    const addKeyAction = {
      type: ENABLE_LOADING,
      key: 'Test'
    };
    expect(reducer({}, addKeyAction)).toEqual(singleLoadingState);

    // a key should not be added twice
    expect(reducer(singleLoadingState, addKeyAction)).toEqual({
      'queue': ['Test'],
      'loading': true
    });

    // add new key to queue
    expect(reducer(singleLoadingState, {
      type: ENABLE_LOADING,
      key: 'Test2'
    })).toEqual({
      'queue': ['Test', 'Test2'],
      'loading': true
    });
  });

  it('should handle DISABLE_LOADING', () => {
    const singleLoadingState = {
      'queue': [],
      'loading': false
    };
    const removeKeyAction = {
      type: DISABLE_LOADING,
      key: 'Test'
    };

    // queue is already empty
    expect(reducer({}, removeKeyAction)).toEqual(singleLoadingState);

    // remove key from queue with two keys
    expect(reducer({
      'queue': ['Test', 'Test2'],
      'loading': true
    }, removeKeyAction)).toEqual({
      'queue': ['Test2'],
      'loading': true
    });

    // remove key from queue with single key
    expect(reducer({
      'queue': ['Test'],
      'loading': true
    }, removeKeyAction)).toEqual({
      'queue': [],
      'loading': false
    });
  });

});
