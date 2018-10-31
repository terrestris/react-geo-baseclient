import ObjectUtil from '@terrestris/base-util/src/ObjectUtil/ObjectUtil';
import OlTileWMS from 'ol/source/TileWMS';
import OlTileLayer from 'ol/layer/Tile';
import OlImageWMS from 'ol/source/ImageWMS';
import OlImageLayer from 'ol/layer/Image';
import OlTileGrid from 'ol/tilegrid/TileGrid';
import OlLayer from 'ol/layer/base';
const union = require('lodash/union');
const unionWith = require('lodash/unionWith');
const isEqual = require('lodash/isEqual');
const find = require('lodash/find');
const isEmpty = require('lodash/isEmpty');
const reverse = require('lodash/reverse');

import { Logger } from '@terrestris/base-util';
import initialState from '../store/initialState';
import getOSMLayer from '@terrestris/vectortiles';

/**
 * This class provides some static methods which can be used with the appContext of SHOGun2.
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
    state.mapLayers = AppContextUtil.parseLayers(mapLayers);

    state.activeModules = union(state.activeModules, activeModules);

    return state;
  }

  /**
   * Parses an array of maplayer objects and returns an array of ol.layer.Layers.
   *
   * @static
   * @param {Array} mapLayerObjArray An array of layerObjects like we get them
   *                                 from the backend.
   * @return {Array} An array of ol.layer.Layer.
   */
  static parseLayers(mapLayerObjArray: object[]) {
    let layers: OlLayer[] = [];
    let tileGrids: any[] = [];

    if (isEmpty(mapLayerObjArray)) {
      return layers;
    }

    mapLayerObjArray.forEach(function(layerObj: any) {
      if ([
        'ImageWMS',
        'TileWMS',
        'WMSTime',
        'OSMVectortiles'
      ].indexOf(layerObj.source.type) < 0) {
        Logger.warn('Currently only TileWMS, ImageWMS, WMSTime and OSMVectortiles layers are supported.');
      }

      if (layerObj.source.type === 'OSMVectortiles') {
        layers.push(getOSMLayer());
      }

      let tileGridObj = ObjectUtil.getValue('tileGrid', layerObj.source);
      let tileGrid;
      if (tileGridObj) {
        tileGrid = find(tileGrids,function(o: any) {
          return isEqual(o.getTileSize()[0], tileGridObj.tileSize) &&
            isEqual(o.getTileSize()[1], tileGridObj.tileSize);
        });
      }

      if (!tileGrid && tileGridObj) {
        tileGrid = new OlTileGrid({
          resolutions: tileGridObj.tileGridResolutions,
          tileSize: [tileGridObj.tileSize, tileGridObj.tileSize],
          extent: [
            tileGridObj.tileGridExtent.lowerLeft.x,
            tileGridObj.tileGridExtent.lowerLeft.y,
            tileGridObj.tileGridExtent.upperRight.x,
            tileGridObj.tileGridExtent.upperRight.y
          ]
        });
        tileGrids = unionWith(tileGrids, [tileGrid], isEqual);
      }

      if (layerObj.source.type === 'TileWMS') {
        layers.push(AppContextUtil.parseTileLayer(layerObj, tileGrid));
      }

      if (['ImageWMS', 'WMSTime'].indexOf(layerObj.source.type) > -1) {
        layers.push(AppContextUtil.parseImageLayer(layerObj));
      }

    });

    reverse(layers);

    return layers;
  }

  /**
   * Parse and create a tile layer.
   * @return {ol.layer.Tile} the new layer
   */
  static parseTileLayer(layerObj: any, tileGrid: any) {
    const layerSource = new OlTileWMS({
      url: layerObj.source.url,
      attributions: layerObj.appearance.attribution,
      tileGrid: tileGrid,
      params: {
        'LAYERS': layerObj.source.layerNames,
        'TILED': layerObj.source.requestWithTiled || false
      }
    });

    return new OlTileLayer({
      source: layerSource,
      visible: layerObj.appearance.visible,
      name: layerObj.name,
      opacity: layerObj.appearance.opacity,
      hoverable: layerObj.appearance.hoverable,
      hoverTemplate: layerObj.appearance.hoverTemplate,
      type: layerObj.source.type
    });
  }

  /**
   * Parse and create a single tile WMS layer.
   * @return {ol.layer.Image} the new layer
   */
  static parseImageLayer(layerObj: any) {
    const layerSource = new OlImageWMS({
      url: layerObj.source.url,
      attributions: layerObj.appearance.attribution,
      params: {
        'LAYERS': layerObj.source.layerNames
      }
    });

    return new OlImageLayer({
      source: layerSource,
      visible: layerObj.appearance.visible,
      name: layerObj.name,
      opacity: layerObj.appearance.opacity,
      hoverable: layerObj.appearance.hoverable,
      hoverTemplate: layerObj.appearance.hoverTemplate,
      type: layerObj.source.type
    });
  }

}

export default AppContextUtil;
