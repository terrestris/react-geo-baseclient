import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import registerServiceWorker from './registerServiceWorker';
import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';
import { LocaleProvider } from 'antd';
import deDE from 'antd/lib/locale-provider/de_DE';
import {
  defaults as OlDefaultControls
} from 'ol/control';
import OlMap from 'ol/Map';
import {
  get as OlGetProjection
} from 'ol/proj';
import OlView from 'ol/View';
import OlScaleLine from 'ol/control/ScaleLine';
import ProjectionUtil from '@terrestris/ol-util/src/ProjectionUtil/ProjectionUtil';
import store from './store/store';
import Main from './Main';

import {
  MapProvider,
  mappify
} from '@terrestris/react-geo';

/**
 * Get the map asynchronoulsy.
 */
const mapPromise = new Promise((resolve) => {
  const subScription = store.subscribe(() => {
    if (store.getState().asyncInitialState.loaded) {
      const map = setupMap(store.getState());
      resolve(map);
      subScription(); // unsubscribe
    }
  });
});

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
      olProjection.setExtent(mapExtent);
    }

    let mapView = new OlView({
      center: center,
      zoom: zoom,
      projection: olProjection,
      resolutions: resolutions
    });

    let map = new OlMap({
      view: mapView,
      keyboardEventTarget: document,
      controls: OlDefaultControls({
        zoom: false,
        attributionOptions: {
          collapsible: true
        }
      }).extend([
        new OlScaleLine()
      ]),
      layers: mapLayers
    });

    return map;
  };

const MappifiedMain = (mappify)(Main);

render(
  <I18nextProvider i18n={i18n}>
    <LocaleProvider locale={deDE}>
      <Provider store={store}>
        <MapProvider map={mapPromise}>
          <MappifiedMain />
        </MapProvider>
      </Provider>
     </LocaleProvider>
   </I18nextProvider>,
  document.getElementById('app')
);
registerServiceWorker();
