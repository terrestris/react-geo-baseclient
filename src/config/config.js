const basePath = window.location.origin +
  window.location.pathname.match(/^\/[\w-]*\/?/)[0];
const buildPath = window.location.origin +
  window.location.pathname.match(/^(\/[\w-]*)*\/\/?/)[0];
const shogun2Path = basePath + 'rest/projectapps/';
const shogunBootPath = basePath + 'applications/';
let staticPath = basePath + 'resources/appContext.json';
let localePath =  basePath + 'resources/i18n/{{lng}}.json';
const appMode = typeof(APP_MODE) != 'undefined' ? APP_MODE : undefined;
const nodeEnv = typeof(process.env.NODE_ENV) != 'undefined' ? process.env.NODE_ENV : undefined;

if (nodeEnv && nodeEnv.indexOf('production') > -1) {
  localePath = buildPath + 'resources/i18n/{{lng}}.json';
}

let appContextPath;
let applicationPath;
let layerPath;
let userPath;
if (appMode === 'start:shogun2') {
  appContextPath = shogun2Path;
  layerPath = basePath + 'rest/layers';
  userPath = basePath + 'rest/users';
  applicationPath = basePath + 'rest/applications';
}
if (appMode === 'start:static') {
  appContextPath = staticPath;
}
if (appMode === 'start:boot') {
  appContextPath = shogunBootPath;
  layerPath = basePath + 'layers';
  userPath = basePath + 'users';
  applicationPath = basePath + 'applications';
}

export default {
  appContextPath,
  layerPath,
  userPath,
  applicationPath,
  appInfoPath: `${basePath}info/app`,
  locale: localePath,
  getBasePath: function (){
    return basePath;
  },
  logoutUrl: `${basePath}sso/logout`,
  printAction: `${basePath}print/print`,
  printCreateUrlAction: `${basePath}print/createUrl.action`,
  printUrlAction: `${basePath}print/doPrint.action`,
  printGetResultAction: `${basePath}print/getPrintResult.action`
};
