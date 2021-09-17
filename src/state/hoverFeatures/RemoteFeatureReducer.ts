import {
  FETCHING_FEATURES,
  FETCHED_FEATURES,
  ERROR_FETCHING_FEATURES,
  CLEAR_FEATURES,
  ADD_FEATURES,
  ABORT_FETCHING_FEATURES
} from '../actions/RemoteFeatureAction';
const unionWith = require('lodash/unionWith');
const initialState: any = {
  isFetching: false,
  features: []
};

/**
 * The reducer.
 *
 * @param {Object} remoteFeatures The initial state to apply for this part of
 *                                the state.
 * @param {Object} action The action object.
 * @return {Object} The new part of the state.
 */
export function fetchRemoteFeaturesOfType(type: string) {
  return function fetchRemoteFeatures(remoteFeatures = initialState, action: any) {
    const passThroughOpts = action.passThroughOpts;

    switch (action.type) {
      case `${FETCHING_FEATURES}_${type}`:
        return Object.assign({}, remoteFeatures, {
          isFetching: true,
          features: [],
          lastUpdated: action.startedAt,
          abortController: action.abortController,
          passThroughOpts
        });
      case `${FETCHED_FEATURES}_${type}`:
        return Object.assign({}, remoteFeatures, {
          isFetching: false,
          features: action.features,
          lastUpdated: action.receivedAt,
          passThroughOpts
        });
      case `${ERROR_FETCHING_FEATURES}_${type}`:
        return Object.assign({}, remoteFeatures, {
          isFetching: false,
          features: [],
          error: action.error.message,
          lastUpdated: action.receivedAt,
          passThroughOpts
        });
      case `${CLEAR_FEATURES}_${type}`:
        return Object.assign({}, remoteFeatures, {
          isFetching: false,
          features: [],
          lastUpdated: action.lastUpdated
        });
      case `${ABORT_FETCHING_FEATURES}_${type}`: {
        if (remoteFeatures.abortController) {
          remoteFeatures.abortController.abort();
        }
        return Object.assign({}, remoteFeatures, {
          isFetching: false,
          features: [],
          abortController: null,
          lastUpdated: action.lastUpdated
        });
      }
      case `${ADD_FEATURES}_${type}`:
        return Object.assign({}, remoteFeatures, {
          isFetching: false,
          features: unionWith(
            remoteFeatures.features,
            action.features,
            (f1: any, f2: any) => f1.getId() === f2.getId()
          )
        });
      default:
        return remoteFeatures;
    }
  };
}

export default fetchRemoteFeaturesOfType;
