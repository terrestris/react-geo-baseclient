import './index.css';
import '../node_modules/antd/dist/antd.less';
import * as React from 'react';

import { render } from 'react-dom';

import { Provider } from 'react-redux';
import './i18n';
import { ConfigProvider } from 'antd';

import deDE from 'antd/lib/locale-provider/de_DE';

import { defaults as OlDefaultControls } from 'ol/control';
import OlMap from 'ol/Map';
import { get as OlGetProjection } from 'ol/proj';
import OlView from 'ol/View';
import OlScaleLine from 'ol/control/ScaleLine';

import ProjectionUtil from '@terrestris/ol-util/src/ProjectionUtil/ProjectionUtil';

import MapProvider from '@terrestris/react-geo/dist/Provider/MapProvider/MapProvider';
import { mappify } from '@terrestris/react-geo/dist/HigherOrderComponent/MappifiedComponent/MappifiedComponent';

import {
  setupStore,
  loadAppContextStore
} from './state/store';

import Main from './Main';
import { SomethingWentWrong } from './SomethingWentWrong';
import { BaseClientState } from './state/reducer';

const MappifiedMain = mappify(Main);

/**
 * The setupMap function
 *
 * Creates the Openlayers map from the initial state.
 *
 * @method setupMap
 * @return {OlMap} The openlayers map.
 */
const setupMap = (state: BaseClientState) => {
  ProjectionUtil.initProj4Definitions();
  ProjectionUtil.initProj4DefinitionMappings();
  const mapViewConfig = state.mapView;
  const mapLayers = state.mapLayers;
  const {
    center,
    zoom,
    projection,
    resolutions,
    mapExtent
  } = mapViewConfig;

  let olProjection;
  if (projection) {
    olProjection = OlGetProjection(projection);
  }

  const mapView = new OlView({
    center: center,
    zoom: zoom,
    projection: olProjection,
    resolutions: resolutions,
    extent: mapExtent,
    constrainOnlyCenter: true,
    constrainResolution: true
  });

  const map = new OlMap({
    view: mapView,
    keyboardEventTarget: document,
    maxTilesLoading: 128,
    controls: OlDefaultControls({
      zoom: false,
      attributionOptions: {
        collapsible: true
      }
    }).extend([
      new OlScaleLine({
        bar: true,
        steps: 4,
        minWidth: 140
      })
    ]),
    layers: mapLayers
  });

  return map;
};

const renderApp = async () => {
  try {
    const state = await loadAppContextStore();
    const store = setupStore(state);
    const map = setupMap(store.getState());

    render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <ConfigProvider locale={deDE}>
          <Provider store={store}>
            <MapProvider map={map}>
              <MappifiedMain />
            </MapProvider>
          </Provider>
        </ConfigProvider>
      </React.Suspense>,
      document.getElementById('app')
    );
  } catch (error) {
    render(
      <SomethingWentWrong
        error={error.message}
      />,
      document.getElementById('app')
    );
  }
};

if (!navigator.serviceWorker.controller) {
  navigator.serviceWorker.register('/sw.js');
}

renderApp();
