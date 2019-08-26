import * as React from 'react';
import ObjectUtil from '@terrestris/base-util/dist/ObjectUtil/ObjectUtil';
import OlTileWMS from 'ol/source/TileWMS';
import OlTileLayer from 'ol/layer/Tile';
import OlImageWMS from 'ol/source/ImageWMS';
import OlImageLayer from 'ol/layer/Image';
import OlTileGrid from 'ol/tilegrid/TileGrid';
import OlLayer from 'ol/layer/Base';

import * as moment from "moment";

const union = require('lodash/union');
const unionWith = require('lodash/unionWith');
const isEqual = require('lodash/isEqual');
const find = require('lodash/find');
const isEmpty = require('lodash/isEmpty');
const reverse = require('lodash/reverse');

import Logger from '@terrestris/base-util/dist/Logger';
import { MapUtil } from '@terrestris/ol-util/dist/MapUtil/MapUtil';

import initialState from '../state/initialState';
import getOSMLayer from '@terrestris/vectortiles';

import PrintButton from '../component/button/PrintButton/PrintButton';
import MeasureMenuButton from '../component/button/MeasureMenuButton/MeasureMenuButton';
import HsiButton from '../component/button/HsiButton/HsiButton';

import ZoomButton from '@terrestris/react-geo/dist/Button/ZoomButton/ZoomButton';
import ZoomToExtentButton from '@terrestris/react-geo/dist/Button/ZoomToExtentButton/ZoomToExtentButton';
import MeasureButton from '@terrestris/react-geo/dist/Button/MeasureButton/MeasureButton';

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

    let state: any = initialState;
    const mapConfig = ObjectUtil.getValue('mapConfig', appContext);
    const mapLayers = ObjectUtil.getValue('mapLayers', appContext);
    const activeModules = ObjectUtil.getValue('activeTools', appContext);

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

    state.appContext = appContext;

    // map scales
    state.mapScales = AppContextUtil.getMapScales(mapConfig.resolutions);

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
        const vectorLayer = getOSMLayer();
        if (!layerObj.appearance.visible) {
          vectorLayer.set('visible', false);
        }
        layers.push(vectorLayer);
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

      if (layerObj.source.type === 'ImageWMS') {
        layers.push(AppContextUtil.parseImageLayer(layerObj));
      }

      if (['TileWMS', 'WMSTime'].indexOf(layerObj.source.type) > -1) {
        layers.push(AppContextUtil.parseTileLayer(layerObj, tileGrid));
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
    const {
      url,
      layerNames,
      crossOrigin,
      requestWithTiled,
      type
    } = layerObj.source;

    const {
      attribution,
      visible,
      opacity,
      hoverable,
      hoverTemplate,
      legendUrl
    } = layerObj.appearance;

    const layerSource = new OlTileWMS({
      url: url,
      attributions: attribution,
      tileGrid: tileGrid,
      params: {
        'LAYERS': layerNames,
        'TILED': requestWithTiled || false,
        'TRANSPARENT': true,
        'TIME': type === 'WMSTime' ? moment(moment.now()).format(layerObj.timeFormat) : undefined
      },
      crossOrigin: crossOrigin
    });

    const tileLayer = new OlTileLayer({
      source: layerSource,
      visible: visible,
      opacity: opacity
    });

    tileLayer.set('name', layerObj.name);
    tileLayer.set('hoverable', hoverable);
    tileLayer.set('hoverTemplate', hoverTemplate);
    tileLayer.set('type', type);
    tileLayer.set('legendUrl', legendUrl);
    tileLayer.set('isBaseLayer', layerObj.isBaseLayer);
    tileLayer.set('topic', layerObj.topic);
    tileLayer.set('topicImg', layerObj.topicImg);
    tileLayer.set('timeFormat', layerObj.source.timeFormat);

    return tileLayer;
  }

  /**
   * Parse and create a single tile WMS layer.
   * @return {ol.layer.Image} the new layer
   */
  static parseImageLayer(layerObj: any) {
    const {
      url,
      layerNames,
      crossOrigin,
      type
    } = layerObj.source;

    const {
      attribution,
      visible,
      opacity,
      hoverable,
      hoverTemplate,
      legendUrl
    } = layerObj.appearance;

    const layerSource = new OlImageWMS({
      projection: undefined,
      url: url,
      attributions: attribution,
      params: {
        'LAYERS': layerNames,
        'TRANSPARENT': true
      },
      crossOrigin: crossOrigin
    });

    const imageLayer = new OlImageLayer({
      source: layerSource,
      visible: visible,
      opacity: opacity
    });

    imageLayer.set('name', layerObj.name);
    imageLayer.set('hoverable', hoverable);
    imageLayer.set('hoverTemplate', hoverTemplate);
    imageLayer.set('type', type);
    imageLayer.set('legendUrl', legendUrl);
    imageLayer.set('isBaseLayer', layerObj.isBaseLayer);
    imageLayer.set('topic', layerObj.topic);
    imageLayer.set('topicImg', layerObj.topicImg);

    return imageLayer;
  }

  /**
   * Return map scales depending on map resolutions.
   *
   * @param {Array} resolutions Resolutions array to obtain map scales from.
   * @param {string} projUnit Projection unit. Default to 'm'
   * @return {Array} Array of computed map scales.
   */
  static getMapScales(resolutions: number[], projUnit: string = 'm'): number[] {
    if (!resolutions) {
      return;
    }

    return resolutions
      .map((res: number) =>
        MapUtil.roundScale(MapUtil.getScaleForResolution(res, projUnit)
        ))
      .reverse();
  }

  /**
   * TODO: Missing features:
   * "shogun-button-stepback",
   * "shogun-button-stepforward",
   * "shogun-button-showredliningtoolspanel"
   * "shogun-button-showworkstatetoolspanel"
   * "shogun-button-addwms"
   * "shogun-button-showmetapanel"
   * @param activeModules
   * @param map
   * @param appContext
   */
  static getToolsForToolbar(activeModules: Array<any>, map: any,
    appContext: any, t:(arg: string) => string, config?: any) {
    let tools:any[] = [];
    const mapConfig = ObjectUtil.getValue('mapConfig', appContext);

    activeModules.forEach((module: any) => {
      switch(module.xtype) {
        case 'basigx-button-zoomin':
          tools.push(<ZoomButton
            delta={1}
            map={map}
            key="1"
            type="primary"
            shape="circle"
            icon="plus"
            tooltip={t('ZoomIn.tooltip')}
            tooltipPlacement={'right'}
          />);
          return;
        case 'basigx-button-zoomout':
        tools.push(<ZoomButton
            delta={-1}
            map={map}
            key="2"
            type="primary"
            shape="circle"
            icon="minus"
            tooltip={t('ZoomOut.tooltip')}
            tooltipPlacement={'right'}
          />);
          return;
        case 'shogun-button-zoomtoextent':
          tools.push(<ZoomToExtentButton
            extent={[
              mapConfig.extent.lowerLeft.x,
              mapConfig.extent.lowerLeft.y,
              mapConfig.extent.upperRight.x,
              mapConfig.extent.upperRight.y,
            ]}
            map={map}
            key="3"
            type="primary"
            shape="circle"
            icon="minus-circle"
          />);
          return;
        case 'shogun-button-print':
          tools.push(<PrintButton
            map={map}
            key="4"
            type="primary"
            shape="circle"
            icon="print"
            config={config}
            tooltip={t('PrintPanel.windowTitle')}
            tooltipPlacement={'right'}
            printScales={this.getMapScales(mapConfig.resolutions)}
            t={t}
          />);
          return;
        case 'shogun-button-hsi':
          tools.push(<HsiButton
            map={map}
            key="5"
            tooltip={t('FeatureInfo.tooltip')}
            tooltipPlacement={'right'}
            t={t}
          />);
          return;
        case 'shogun-button-measure-menu':
          if (module.properties.measureTypes.length === 1) {
            tools.push(<MeasureButton
              map={map}
              measureType={module.properties.measureTypes[0]}
              key="6"
              tooltip={t('FeatureInfo.tooltip')}
              tooltipPlacement={'right'}
              showMeasureInfoOnClickedPoints={true}
            />);
          } else {
            tools.push(<MeasureMenuButton
              type="primary"
              shape="circle"
              map={map}
              measureTypes={module.properties.measureTypes}
              key="6"
              tooltip={t('FeatureInfo.tooltip')}
              t={t}
            />);
          }
          return;
        default:
          return;
      }

    });
    return tools;
  }

  static measureToolsEnabled(activeModules: Array<any>) {
    return activeModules.map((module: any) => module.xtype === 'shogun-button-showmeasuretoolspanel').indexOf(true) > -1;
  }

}

export default AppContextUtil;
