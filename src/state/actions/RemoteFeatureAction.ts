import OlFormatGeoJson from 'ol/format/GeoJSON';
import Logger from '@terrestris/base-util/dist/Logger';
import FeatureUtil from '@terrestris/ol-util/dist/FeatureUtil/FeatureUtil';

const isEmpty = require('lodash/isEmpty');

/**
 * Action types
 */
export const FETCHING_FEATURES = 'FETCHING_FEATURES';
export const FETCHED_FEATURES = 'FETCHED_FEATURES';
export const ERROR_FETCHING_FEATURES = 'ERROR_FETCHING_FEATURES';
export const CLEAR_FEATURES = 'CLEAR_FEATURES';
export const ADD_FEATURES = 'ADD_FEATURES';
export const ABORT_FETCHING_FEATURES = 'ABORT_FETCHING_FEATURES';

/**
 * @param {String} type The type. e.g. 'HOVER'
 * @param {AbortController} abortController The abort controller
 * @param {Array} features An array of ol.feature.
 * @param {Object} passThroughOpts
 *
 * @return {Object} The FETCHING_FEATURES action conditional to the type.
 */
export function fetchingFeatures(type: string, abortController: AbortController, passThroughOpts?: any) {
  return {
    type: `${FETCHING_FEATURES}_${type}`,
    abortController,
    startedAt: Date.now(),
    passThroughOpts
  };
}

/**
 *
 * @param {String} type The type. e.g. 'HOVER'
 * @param {Object} features Object containing features sorted by feature type name.
 * @param {Object} passThroughOpts
 *
 * @return {Object} The FETCHED_FEATURES action conditional to the type.
 */
export function fetchedFeatures(type: string, features: any, passThroughOpts?: any) {
  return {
    type: `${FETCHED_FEATURES}_${type}`,
    features: features,
    receivedAt: Date.now(),
    passThroughOpts
  };
}

/**
 *
 * @param {String} type The type. e.g. 'HOVER'
 * @param {Error} error The fetch error.
 * @param {Object} passThroughOpts
 *
 * @return {Object} The FETCHED_FEATURES action conditional to the type.
 */
export function errorFetchingFeatures(type: string, error: Error, passThroughOpts?: any) {
  return {
    type: `${ERROR_FETCHING_FEATURES}_${type}`,
    error: error,
    receivedAt: Date.now(),
    passThroughOpts
  };
}

/**
 *
 * @param {String} type The type. e.g. 'HOVER'
 * @param {Object} passThroughOpts
 *
 * @return {Object} The FETCHED_FEATURES action conditional to the type.
 */
export function abortFetchingFeatures(type: string, passThroughOpts?: any) {
  return {
    type: `${ABORT_FETCHING_FEATURES}_${type}`,
    passThroughOpts
  };
}

/**
 * This thunk is used to create an action method to request remote features,
 * e.g. via WMS GetFeatureInfo or WFS GetFeature.
 *
 * @param {String} type The type. e.g. 'HOVER'
 * @param {String} urls The list of URLs to fetch the features from.
 * @param {Object} passThroughOpts An object that should be added to the final
 *                                 state. It will be appended to the state as is
 *                                 with no further interpretation.
 * @param {Object} fetchOpts The options to apply to the fetch,
 *                           see https://github.github.io/fetch/.
 * @param {ol.format} format The ol.format instance to read the fetched features
 *                           with, default is to new ol.format.GeoJSON().
 * @param {Object} readerOpts The options to apply to the readFeatures() method
 *                            provided by the ol.format instance. The default
 *                            sets `featureProjection` to the current map
 *                            projection.
 * @return {Function} The thunk.
 */
export function fetchFeatures(type: string, urls: string[], passThroughOpts: any,
  fetchOpts?: any, format?: any, readerOpts?: any) {
  let last = 0;
  return async function (dispatch: Function, getState: Function) {
    const currentTime = new Date().getTime();
    if (last < currentTime) {
      last = currentTime;
    }
    const controller = new AbortController();
    const signal = controller.signal;

    signal.addEventListener('abort', () => {
      // Logs true:
      Logger.warn('Request to ', urls, ' aborted:', signal.aborted);
      // make sure fetchedfeatures is not dispatched for this one:
      if (last === currentTime) {
        last = 0;
      }
    });

    // Only proceed, if at least one URL is given.
    if (urls.length === 0) {
      return;
    }

    const defaultFetchOpts = {
      method: 'GET',
      credentials: 'same-origin',
      signal
    };
    fetchOpts = Object.assign({}, defaultFetchOpts, fetchOpts);
    format = format || new OlFormatGeoJson();
    const defaultReaderOpts = {
      featureProjection: getState().mapView.present.projection
    };
    readerOpts = Object.assign({}, defaultReaderOpts, readerOpts);

    const dispatcher: any[] = [];

    // Iterate all given URLs and create a dispatcher method for each one.
    urls.forEach((url) => {
      // Skip internal URLs (temporary layers).
      if (url.startsWith('internal://')) {
        return;
      }
      // eslint-disable-next-line
      dispatcher.push(dispatch(fetchFeaturesFromResource(url, fetchOpts, format, readerOpts)));
    });

    // Set loading to true by dispatching the following action.
    dispatch(fetchingFeatures(type, controller, passThroughOpts));

    try {
      // Load all single resources.
      const dispatchFeatures = await Promise.all(dispatcher);

      // only dispatch if we're not out of date
      if (last === currentTime) {
        let resultFeatures = {};
        dispatchFeatures.forEach(feat => {
          if (!isEmpty(feat.features)) {
            Object.assign(resultFeatures, feat.features);
          }
        });
        resultFeatures = { ...resultFeatures, ...passThroughOpts.internalVectorFeatures };

        if (!isEmpty(passThroughOpts.internalVectorFeatures)) {
          delete passThroughOpts.internalVectorFeatures;
        }
        // As soon as all single actions are fulfilled, write the combined
        // features into the state.
        return dispatch(fetchedFeatures(type, resultFeatures, passThroughOpts));
      }
    } catch (error) {
      return dispatch(fetchedFeatures(type, {}, passThroughOpts));
    }

  };
}

/**
 * Fetches the response from the given url and parses the response (if any) as
 * ol features.
 *
 * @param {String} url The URL to fetch the features from.
 * @param {Object} fetchOpts The options to apply to the fetch,
 *                           see https://github.github.io/fetch/.
 * @param {ol.format} format The ol.format instance to read the fetched features
 *                           with.
 * @param {Object} readerOpts The options to apply to the readFeatures() method
 *                            provided by the ol.format instance.
 * @return {Function} The thunk.
 */
export function fetchFeaturesFromResource(url: string, fetchOpts: any, format: any, readerOpts: any) {
  return (/* dispatch*/) => {
    return fetch(url, fetchOpts)
      .then(response => response.text())
      .then(text => {
        let features = format.readFeatures(text, readerOpts);
        features.forEach((feat: any) => {
          const layerName = FeatureUtil.getFeatureTypeNameFromGetFeatureInfoUrl(url);
          feat.set('layerName', layerName);
        });
        features = features.reduce((resultFeat: any, currFeat: any) => {
          const name = currFeat.get('layerName');
          (resultFeat[name] || (resultFeat[name] = [])).push(currFeat);
          return resultFeat;
        }, {});

        return {
          request: url,
          features: features
        };
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          return {
            request: url,
            features: {}
          };
        } else {
          return {
            request: url,
            features: {},
            error: error.message
          };
        }
      });
  };
}

/**
 * @param {String} type The type. e.g. 'HOVER'
 *
 * @return {Object} The CLEAR_FEATURES action conditional to the type.
 */
export function clearFeatures(type: string) {
  return {
    type: `${CLEAR_FEATURES}_${type}`,
    lastUpdated: Date.now()
  };
}
