import moment from 'moment';

import { BaseClientState } from './reducer';

export default {
  mapView: {
    center: [0, 0],
    zoom: 0,
    projection: 'EPSG:3857',
    resolutions: [],
    mapExtent: null
  },
  mapScales: [],
  appInfo: {
    name: 'React-geo baseclient',
    versionNumber: '0.1 (dev)'
  },
  defaultTopic: null,
  loadingQueue: {
    queue: [],
    loading: false
  },
  mapLayers: null,
  activeModules: [],
  appContext: {},
  hoverFeatures: {
    isFetching: false,
    features: {},
    error: null,
    lastUpdated: null
  },
  appState: {
    addLayerWindow: false,
    helpModal: false,
    layerTree: false
  },
  dataRange: {
    startDate: moment().subtract(1, 'days'),
    endDate: moment().add(1, 'days')
  },
  userInfo: null
} as BaseClientState;
