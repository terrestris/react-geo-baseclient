const nodeEnv = typeof (process.env.NODE_ENV) !== 'undefined' ? process.env.NODE_ENV : undefined;
const appPrefix = (typeof (process.env.APP_PREFIX) !== 'undefined' &&
  nodeEnv && nodeEnv.indexOf('production') > -1) ? process.env.APP_PREFIX : '/';
const basePath = window.location.origin + appPrefix;
const buildPath = window.location.origin +
  window.location.pathname.match(/^(\/[\w-]*)*\/\/?/)[0];
const shogun2Path = basePath + 'rest/projectapps/';
const shogunBootPath = basePath + 'applications/';
let staticPath = basePath + 'resources/appContext.json';
let localePath = basePath + 'resources/i18n/{{lng}}.json';
const appMode = typeof (process.env.APP_MODE) !== 'undefined' ? process.env.APP_MODE : '';

if (nodeEnv && nodeEnv.indexOf('production') > -1) {
  localePath = buildPath + 'resources/i18n/{{lng}}.json';
}

let appContextPath;
let applicationPath;
let layerPath;
let userPath;
if (appMode.indexOf('shogun2') > -1) {
  appContextPath = shogun2Path;
  layerPath = basePath + 'rest/layers';
  userPath = basePath + 'rest/users';
  applicationPath = basePath + 'rest/applications';
}
if (appMode.indexOf('static') > -1) {
  appContextPath = staticPath;
}
if (appMode.indexOf('boot') > -1) {
  appContextPath = shogunBootPath;
  layerPath = basePath + 'layers';
  userPath = basePath + 'users';
  applicationPath = basePath + 'applications';
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
  geoserverActionPath: `${basePath}geoserver.action`,
  appInfoPath: `${basePath}info/app`,
  locale: localePath,
  getBasePath: function() {
    return basePath;
  },
  logoutUrl: `${basePath}sso/logout`,
  printAction: `${basePath}print/print`,
  printCreateUrlAction: `${basePath}print/createUrl.action`,
  printUrlAction: `${basePath}print/doPrint.action`,
  printGetResultAction: `${basePath}print/getPrintResult.action`,
  // client / component configuration
  ...clientComponentConfig
};
