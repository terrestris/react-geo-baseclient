const nodeEnv = typeof (process.env.NODE_ENV) !== 'undefined' ? process.env.NODE_ENV : undefined;
const appPrefix = (typeof (process.env.APP_PREFIX) !== 'undefined' &&
  nodeEnv && nodeEnv.indexOf('production') > -1) ? process.env.APP_PREFIX : '/';
const clientPath = window.location.origin + appPrefix;
const backendPath = (typeof (process.env.BACKEND_PATH) !== 'undefined' &&
nodeEnv && nodeEnv.indexOf('production') > -1) ? process.env.BACKEND_PATH : '/';
const appMode = typeof (process.env.APP_MODE) !== 'undefined' ? process.env.APP_MODE : '';

let localePath = clientPath + 'resources/i18n/{{lng}}.json';
if (nodeEnv && nodeEnv.indexOf('production') > -1) {
  localePath = clientPath + 'resources/i18n/{{lng}}.json';
}

let appContextPath;
let applicationPath;
let layerPath;
let userPath;
if (appMode.indexOf('static') > -1) {
  appContextPath = `${clientPath}resources/appContext.json`;
}
if (appMode.indexOf('shogun2') > -1) {
  appContextPath = `${backendPath}rest/projectapps/`;
  layerPath = `${backendPath}rest/layers`;
  userPath = `${backendPath}rest/users`;
  applicationPath = `${backendPath}rest/applications`;
}
if (appMode.indexOf('boot') > -1) {
  appContextPath = `${backendPath}applications`;
  layerPath = `${backendPath}layers`;
  userPath = `${backendPath}users`;
  applicationPath = `${backendPath}applications`;
}

const clientComponentConfig = {
  tooltipProps: {
    mouseEnterDelay: .5
  }
};

export default {
  // path configuration
  appContextPath,
  layerPath,
  userPath,
  applicationPath,
  geoserverActionPath: `${backendPath}geoserver.action`,
  appInfoPath: `${backendPath}info/app`,
  locale: localePath,
  getClientPath: function() {
    return clientPath;
  },
  getBackendPath: function() {
    return backendPath;
  },
  logoutUrl: `${backendPath}sso/logout`,
  printAction: `${backendPath}print/print`,
  printCreateUrlAction: `${backendPath}print/createUrl.action`,
  printUrlAction: `${backendPath}print/doPrint.action`,
  printGetResultAction: `${backendPath}print/getPrintResult.action`,
  // client / component configuration
  ...clientComponentConfig
};
