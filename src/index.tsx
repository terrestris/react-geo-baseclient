import './index.css';
import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import './i18n';
import { ConfigProvider } from 'antd';
import 'antd/dist/antd.min.css'; // should be working via the loader but it does not..
import deDE from 'antd/lib/locale-provider/de_DE';
import { defaults as OlDefaultControls } from 'ol/control';
import OlMap from 'ol/Map';
import  { get as OlGetProjection } from 'ol/proj';

import OlView from 'ol/View';
import OlScaleLine from 'ol/control/ScaleLine';
import ProjectionUtil from '@terrestris/ol-util/src/ProjectionUtil/ProjectionUtil';
import store from './state/store';
import Main from './Main';
import SomethingWentWrong from './SomethingWentWrong';

import MapProvider from '@terrestris/react-geo/dist/Provider/MapProvider/MapProvider';
import { mappify } from '@terrestris/react-geo/dist/HigherOrderComponent/MappifiedComponent/MappifiedComponent';

/**
 * The setupMap function
 *
 * Creates the Openlayers map from the initial state.
 *
 * @method setupMap
 * @return {OlMap} The openlayers map.
 */
const setupMap = (state: any) => {
  ProjectionUtil.initProj4Definitions();
  ProjectionUtil.initProj4DefinitionMappings();
  const mapViewConfig = state.mapView.present;
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

/**
 * Get the map asynchronoulsy.
 */
const mapPromise: Promise<OlMap> = new Promise((resolve, reject) => {
  const subScription = store.subscribe(() => {
    const state: any = store.getState();
    const errorOnAppContext = state.asyncInitialState.error;
    if (errorOnAppContext !== null) {
      reject(errorOnAppContext);
    }
    if (state.asyncInitialState.loaded) {
      const map = setupMap(store.getState());
      resolve(map);
      subScription(); // unsubscribe
    }
  });
}).catch(err => {
  render(
    <SomethingWentWrong
      error={err.message}
    />,
    document.getElementById('app')
  );
  throw err;
}) as Promise<OlMap>;

const MappifiedMain = (mappify)(Main);

render(
  <React.Suspense fallback={<div>Loading...</div>}>
    <ConfigProvider locale={deDE}>
      <Provider store={store}>
        <MapProvider map={mapPromise}>
          <MappifiedMain />
        </MapProvider>
      </Provider>
    </ConfigProvider>
  </React.Suspense>,
  document.getElementById('app')
);
