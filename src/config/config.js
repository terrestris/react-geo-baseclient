const basePath = '../../';
const staticPath = basePath + 'resources/appContext.json';
const shogun2Path = basePath + 'rest/applications/';
const appMode = typeof(APP_MODE) != "undefined" ? APP_MODE : undefined;

export default {
  appContextPath: !appMode || appMode === 'start-shogun2' ? shogun2Path : appMode === 'start-static' ? staticPath : null,
  layerPath: basePath + 'rest/layers',
  // locale: basePath + 'locale/client/{{lng}}.json',
  getBasePath: function (){
    return basePath;
  }
};
