import OlLayerBase from 'ol/layer/Base';
import { ProjectionLike } from 'ol/proj';

import { MapUtil } from '@terrestris/ol-util/dist/MapUtil/MapUtil';

import { BaseClientState } from '../../state/reducers/Reducer';

export interface AppContextUtil {
  canReadCurrentAppContext: () => boolean;
  appContextToState: (appContext: any) => Promise<BaseClientState>;
  parseLayer: (layer: any, projection?: ProjectionLike) => OlLayerBase | Promise<OlLayerBase>;
  parseTileLayer: (layer: any, projection?: ProjectionLike) => {};
  parseImageLayer: (layer: any) => {};
  getToolsForToolbar: (activeModules: any[], map: any,
    appContext: any,t: (arg: string) => string, config?: any,
    getPermalink?: () => string) => {};
  measureToolsEnabled: (activeModules: any[]) => boolean;
  getBackgroundLayers?: () => OlLayerBase[];
}

/**
 * This class provides some methods which can be used with the appContext of SHOGun2.
 *
 * @class BaseAppContextUtil
 */
class BaseAppContextUtil {

  /**
   * Return map scales depending on map resolutions.
   *
   * @param {Array} resolutions Resolutions array to obtain map scales from.
   * @param {string} projUnit Projection unit. Default to 'm'
   * @return {Array} Array of computed map scales.
   */
  getMapScales(resolutions: number[], projUnit: string = 'm'): number[] {
    if (!resolutions) {
      return;
    }

    return resolutions
      .map((res: number) =>
        MapUtil.roundScale(MapUtil.getScaleForResolution(res, projUnit)
        ))
      .reverse();
  }

}

export default BaseAppContextUtil;
