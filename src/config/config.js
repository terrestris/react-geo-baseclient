const basePath = window.location.origin +
  window.location.pathname.match(/^\/[\w-]*\/?/)[0];
const buildPath = window.location.origin +
  window.location.pathname.match(/^(\/[\w-]*)*\/\/?/)[0];
const shogun2Path = basePath + 'rest/projectapps/';
const shogunBootPath = basePath + 'applications/';
let staticPath = basePath + 'resources/appContext.json';
let localePath =  basePath + 'resources/i18n/{{lng}}.json';
const appMode = typeof(APP_MODE) != "undefined" ? APP_MODE : undefined;
const nodeEnv = typeof(process.env.NODE_ENV) != "undefined" ? process.env.NODE_ENV : undefined;

if (nodeEnv && nodeEnv.indexOf('production') > -1) {
  localePath = buildPath + 'resources/i18n/{{lng}}.json';
}

let appContextPath;
if (appMode === 'start:shogun2') {
  appContextPath = shogun2Path;
}
if (appMode === 'start:static') {
  appContextPath = staticPath;
}
if (appMode === 'start:boot') {
  appContextPath = shogunBootPath;
}

export default {
  appContextPath: appContextPath,
  layerPath: basePath + 'rest/layers',
  locale:  localePath,
  getBasePath: function (){
    return basePath;
  },
  printAction: `${basePath}print/print`,
  printCreateUrlAction: `${basePath}print/createUrl.action`,
  printUrlAction: `${basePath}print/doPrint.action`,
  printGetResultAction: `${basePath}print/getPrintResult.action`
};
