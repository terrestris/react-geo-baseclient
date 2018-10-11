import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import registerServiceWorker from './registerServiceWorker';
import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';
import { LocaleProvider } from 'antd';
import deDE from 'antd/lib/locale-provider/de_DE';
import store from './store/store';
import Main from './Main';
import MapUtils from './util/MapUtils';

import {
  MapProvider,
  mappify
} from '@terrestris/react-geo';

/**
 * Get the map asynchronoulsy from the setupMap functionfrom the MapUtils.
 */
const mapPromise = new Promise((resolve) => {
  const subScription = store.subscribe(() => {
    if (store.getState().asyncInitialState.loaded) {
      const map = MapUtils.setupMap(store.getState());
      resolve(map);
      subScription(); // unsubscribe
    }
  });
});

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