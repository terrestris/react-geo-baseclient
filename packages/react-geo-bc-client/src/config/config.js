const basePath = '../../';

export default {
  appContextPath: basePath + 'rest/applications/',
  layerPath: basePath + 'rest/layers',
  // locale: basePath + 'locale/client/{{lng}}.json',
  getBasePath: function (){
    return basePath;
  }
};
