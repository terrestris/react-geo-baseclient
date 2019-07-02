const basePath = window.location.origin +
  window.location.pathname.match(/^\/[\w-]*\/?/)[0];
const buildPath = window.location.origin +
  window.location.pathname.match(/^(\/[\w-]*)*\/\/?/)[0];
const shogun2Path = basePath + 'rest/applications/';
let staticPath = basePath + 'resources/appContext.json';
let localePath =  basePath + 'resources/i18n/{{lng}}.json';
const appMode = typeof(APP_MODE) != "undefined" ? APP_MODE : undefined;
const nodeEnv = typeof(process.env.NODE_ENV) != "undefined" ? process.env.NODE_ENV : undefined;

if (nodeEnv && nodeEnv.indexOf('production') > -1) {
  localePath = buildPath + 'resources/i18n/{{lng}}.json';
}

export default {
  appContextPath: !appMode || appMode.indexOf('shogun2') > -1 ? shogun2Path : appMode.indexOf('static') > -1 ? staticPath : null,
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
