const basePath = '../../';
const shogun2Path = basePath + 'rest/applications/';
let staticPath = 'resources/appContext.json';
const appMode = typeof(APP_MODE) != "undefined" ? APP_MODE : undefined;
if (appMode && appMode.indexOf('build:static') > -1) {
  staticPath = basePath + 'build/' + staticPath;
} else {
  staticPath = basePath + staticPath;
}

export default {
  appContextPath: !appMode || appMode.indexOf('shogun2') > -1 ? shogun2Path : appMode.indexOf('static') > -1 ? staticPath : null,
  layerPath: basePath + 'rest/layers',
  // locale: basePath + 'locale/client/{{lng}}.json',
  getBasePath: function (){
    return basePath;
  }
};
