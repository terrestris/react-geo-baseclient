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
    addLayerWindowVisible: false
  },
  dataRange: {
    startDate: moment(moment.now()).subtract(1, 'days'),
    endDate: moment(moment.now()).add(1, 'days')
  }
};
