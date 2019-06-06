/* Copyright © terrestris GmbH & Co. KG, 2016 – present
 * https://www.terrestris.de, info@terrestris.de
 *
 * The 2-Clause BSD License
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
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
    let passThroughOpts = action.passThroughOpts;

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
