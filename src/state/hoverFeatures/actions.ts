import {
  createAction,
  createAsyncThunk
} from '@reduxjs/toolkit';

import isEmpty from 'lodash/isEmpty';

import OlFormatGeoJson from 'ol/format/GeoJSON';
import OlFeatureFormat, { ReadOptions as OlReadOptions } from 'ol/format/Feature';
import OlFeature, { FeatureLike as OlFeatureLike } from 'ol/Feature';

import Logger from '@terrestris/base-util/dist/Logger';

import FeatureUtil from '@terrestris/ol-util/dist/FeatureUtil/FeatureUtil';

import { BaseClientState } from '../reducer';

export interface RequestOptions {
  type: string;
  urls: string[];
  fetchOpts?: RequestInit;
  format?: OlFeatureFormat;
  readerOpts?: OlReadOptions;
  passThroughOpts: any;
};

export interface FeatureResponse {
  request: string;
  features: OlFeatureLike[];
  error?: string;
};

export const clearFeatures = createAction<string>('hoverFeatures/clear');

let last = 0;
export const fetchFeatures = createAsyncThunk('activeModules/addActive',
  async (requestOpts: RequestOptions, thunkAPI) => {
    const {
      type,
      urls,
      passThroughOpts,
      format = new OlFormatGeoJson(),
      readerOpts,
      fetchOpts
    } = requestOpts;

    const currentTime = new Date().getTime();

    if (last < currentTime) {
      last = currentTime;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    signal.addEventListener('abort', () => {
      Logger.warn('Request to ', urls, ' aborted:', signal.aborted);
      if (last === currentTime) {
        last = 0;
      }
    });

    if (urls.length === 0) {
      return;
    }

    const defaultFetchOpts: RequestInit = {
      method: 'GET',
      credentials: 'same-origin',
      signal
    };
    const mergedFetchOpts = {...defaultFetchOpts, ...fetchOpts};
    const defaultReaderOpts = {
      // @ts-ignore
      featureProjection: (thunkAPI.getState() as BaseClientState).mapView.present.projection
    };
    const mergedReaderOpts = {...defaultReaderOpts, ...readerOpts};

    const dispatcher: any[] = [];

    urls.forEach((url) => {
      // Skip internal URLs (temporary layers).
      if (url.startsWith('internal://')) {
        return;
      }
      dispatcher.push(fetchFeaturesFromResource(url, mergedFetchOpts, format, mergedReaderOpts));
    });

    // Set loading to true by dispatching the following action.
    // thunkAPI.dispatch(fetchingFeatures(type, controller, passThroughOpts));

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

        return resultFeatures;
        // As soon as all single actions are fulfilled, write the combined
        // features into the state.
        // return thunkAPI.dispatch(fetchedFeatures(type, resultFeatures, passThroughOpts));
      }
    } catch (error) {
      // return thunkAPI.dispatch(fetchedFeatures(type, {}, passThroughOpts));
    }
  }
);

// TODO
const fetchFeaturesFromResource = async (url: string, fetchOpts: RequestInit,
  format: OlFeatureFormat, readerOpts: OlReadOptions): Promise<FeatureResponse> => {
  try {
    const response = await fetch(url, fetchOpts);

    if (!response.ok) {
      throw new Error('Error while requesting features');
    }

    const responseText = await response.text();

    let features = format.readFeatures(responseText, readerOpts);

    features.forEach((feat: OlFeature) => {
      const layerName: string = FeatureUtil.getFeatureTypeNameFromGetFeatureInfoUrl(url);
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
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        request: url,
        features: []
      };
    } else {
      return {
        request: url,
        features: [],
        error: error.message
      };
    }
  }
};
