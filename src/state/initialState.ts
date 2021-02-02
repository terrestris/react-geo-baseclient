import moment from 'moment';

export default {
  mapView: {
    present: {
      center: [0, 0],
      zoom: 0,
      projection: 'EPSG:3857',
      resolutions: [],
      mapExtent: []
    },
    past: [],
    future: []
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
  mapLayers: [],
  activeModules: [],
  appContext: {},
  hoverFeatures: {
    isFetching: false,
    features: {}
  },
  appState: {
    addLayerWindowVisible: false,
    helpModalVisible: false,
    layerTreeVisible: false
  },
  dataRange: {
    startDate: moment().subtract(1, 'days'),
    endDate: moment().add(1, 'days')
  }
};
