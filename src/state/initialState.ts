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
  }
};
