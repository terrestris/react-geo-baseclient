export default {
  mapView: {
    present: {
      center: [370000, 5546750],
      zoom: 0,
      projection: 'EPSG:3857',
      resolutions: [560, 280, 140, 70, 28, 14, 7, 2.8, 1.4, 0.7, 0.28, 0.14, 0.028],
      mapExtent: [-20026376.39, -20048966.1, 20026376.39, 20048966.1]
    },
    past: [],
    future: []
  },
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
  appContext: {}
  // hoverFeatures: {
  //   isFetching: false,
  //   features: []
  // },
  // selectFeatures: {
  //   isFetching: false,
  //   features: []
  // },
};
