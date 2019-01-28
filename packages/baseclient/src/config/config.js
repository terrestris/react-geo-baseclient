const basePath = '../../';
const shogun2Path = basePath + 'rest/applications/';
let staticPath = basePath + 'resources/appContext.json';
const appMode = typeof(APP_MODE) != "undefined" ? APP_MODE : undefined;

export default {
  appContextPath: !appMode || appMode.indexOf('shogun2') > -1 ? shogun2Path : appMode.indexOf('static') > -1 ? staticPath : null,
  layerPath: basePath + 'rest/layers',
  locale: basePath + 'resources/i18n/{{lng}}.json',
  getBasePath: function (){
    return basePath;
  },
  printAction: `${basePath}print/print`,
  printCreateUrlAction: `${basePath}print/createUrl.action`,
  printUrlAction: `${basePath}print/doPrint.action`,
  printGetResultAction: `${basePath}print/getPrintResult.action`,
};
