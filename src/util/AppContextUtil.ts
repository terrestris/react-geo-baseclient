import ObjectUtil from '@terrestris/base-util/src/ObjectUtil/ObjectUtil';
import { union } from 'lodash';
import MapUtils from './MapUtils';

import initialState from '../store/initialState';

/**
 * This class provides some static methods which can be used with the appContext.
 *
 * @class AppContextUtil
 */
class AppContextUtil {

  /**
   * This method parses an appContext object as delivered by SHOGun2 and returns
   * an storeObject as expected by the redux store.
   * @param {Object} appContext The appContext.
   * @return {Object} The initialState used by the store.
   */
  static appContextToState(appContext: any) {
    var state: any = initialState;
    var mapConfig = ObjectUtil.getValue('mapConfig', appContext);
    var mapLayers = ObjectUtil.getValue('mapLayers', appContext);
    var activeModules = ObjectUtil.getValue('activeTools', appContext);

    // AppInfo
    state.appInfo.name = appContext.name || state.appInfo.name;

    // MapView
    state.mapView.present.center = [
      mapConfig.center.x,
      mapConfig.center.y
    ];
    state.mapView.present.mapExtent = [
      mapConfig.extent.lowerLeft.x,
      mapConfig.extent.lowerLeft.y,
      mapConfig.extent.upperRight.x,
      mapConfig.extent.upperRight.y,
    ];
    state.mapView.present.projection = mapConfig.projection.indexOf('EPSG:') < 0
      ? 'EPSG:' + mapConfig.projection : mapConfig.projection;
    state.mapView.present.resolutions = mapConfig.resolutions;
    state.mapView.present.zoom = mapConfig.zoom;

    // mapLayers
    state.mapLayers = union(state.mapLayers , mapLayers);
    state.mapLayers = MapUtils.parseLayers(mapLayers);

    state.activeModules = union(state.activeModules, activeModules);

    return state;
  }

}

export default AppContextUtil;
