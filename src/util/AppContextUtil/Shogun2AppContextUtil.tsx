import * as React from 'react';

import OlTileWMS from 'ol/source/TileWMS';
import OlSourceWMTS from 'ol/source/WMTS.js';
import OlTileGridWMTS from 'ol/tilegrid/WMTS.js';
import OlTileLayer from 'ol/layer/Tile';
import OlImageWMS from 'ol/source/ImageWMS';
import OlImageLayer from 'ol/layer/Image';
import OlTileGrid from 'ol/tilegrid/TileGrid';
import OlLayer from 'ol/layer/Base';
import OlLayerGroup from 'ol/layer/Group';

import * as moment from 'moment';

const union = require('lodash/union');
const isEmpty = require('lodash/isEmpty');
const reverse = require('lodash/reverse');

import isMobile from 'is-mobile';

import ZoomButton from '@terrestris/react-geo/dist/Button/ZoomButton/ZoomButton';
import ZoomToExtentButton from '@terrestris/react-geo/dist/Button/ZoomToExtentButton/ZoomToExtentButton';
import MeasureButton from '@terrestris/react-geo/dist/Button/MeasureButton/MeasureButton';

import Logger from '@terrestris/base-util/dist/Logger';
import ObjectUtil from '@terrestris/base-util/dist/ObjectUtil/ObjectUtil';

import getOSMLayer from '@terrestris/vectortiles';

import initialState from '../../state/initialState';

import PrintButton from '../../component/button/PrintButton/PrintButton';
import MeasureMenuButton from '../../component/button/MeasureMenuButton/MeasureMenuButton';
import HsiButton from '../../component/button/HsiButton/HsiButton';

import BaseAppContextUtil, { AppContextUtil } from './BaseAppContextUtil';

/**
 * This class provides some methods which can be used with the appContext of SHOGun2.
 */
class Shogun2AppContextUtil extends BaseAppContextUtil implements AppContextUtil {

  canReadCurrentAppContext() {
    const appMode = typeof(APP_MODE) != 'undefined' ? APP_MODE : undefined;

    return appMode.indexOf('shogun2') > -1 || appMode.indexOf('static') > -1;
  }

  /**
   * This method parses an appContext object as delivered by SHOGun2 and returns
   * an storeObject as expected by the redux store.
   * @param {Object} appContext The appContext.
   * @return {Object} The initialState used by the store.
   */
  async appContextToState(appContext: any) {

    const state: any = initialState;
    const mapConfig = ObjectUtil.getValue('mapConfig', appContext);
    const activeModules = ObjectUtil.getValue('activeTools', appContext);
    const defaultTopic = ObjectUtil.getValue('defaultTopic', appContext);
    const layerTree = appContext.layerTree;

    // appInfo
    state.appInfo.name = appContext.name || state.appInfo.name;

    // mapView
    state.mapView.present.center = [
      mapConfig.center.x,
      mapConfig.center.y
    ];
    state.mapView.present.mapExtent = [
      mapConfig.extent.lowerLeft.x,
      mapConfig.extent.lowerLeft.y,
      mapConfig.extent.upperRight.x,
      mapConfig.extent.upperRight.y
    ];
    state.mapView.present.projection = mapConfig.projection.indexOf('EPSG:') < 0
      ? 'EPSG:' + mapConfig.projection : mapConfig.projection;
    state.mapView.present.resolutions = mapConfig.resolutions;
    state.mapView.present.zoom = mapConfig.zoom;

    // mapLayers
    state.mapLayers = await this.parseLayertree(layerTree);

    // activeModules
    state.activeModules = union(state.activeModules, activeModules);

    // defaultTopic
    state.defaultTopic = defaultTopic;

    // mapScales
    state.mapScales = this.getMapScales(mapConfig.resolutions);

    state.appContext = appContext;

    return state;
  }

  parseLayertree(folder: any) {
    const tree = new OlLayerGroup({
      layers: this.parseNodes(folder.children).reverse(),
      visible: folder.checked,
    });
    return tree;
  }

  parseNodes(nodes: []) {
    const collection: any[] = [];
    nodes.forEach((node: any) => {
      if (node.leaf === true) {
        // layer
        node.layer.name = node.text;
        node.layer.appearance.visible = node.checked;
        collection.push(this.parseLayers([node.layer])[0]);
      } else {
        // folder
        collection.push(this.parseFolder(node));
      }
    });
    return collection;
  }

  parseFolder(el: any) {
    const folder = new OlLayerGroup({
      layers: this.parseNodes(el.children).reverse(),
      visible: el.checked
    });
    folder.set('name', el.text);
    return folder;
  }

  parseLayer(layer: any) {
    if ([
      'ImageWMS',
      'TileWMS',
      'WMTS',
      'WMSTime',
      'OSMVectortiles'
    ].indexOf(layer.source.type) < 0) {
      Logger.warn('Currently only TileWMS, ImageWMS, WMSTime and OSMVectortiles layers are supported.');
    }

    if (layer.source.type === 'OSMVectortiles') {
      const vectorLayer = getOSMLayer();
      if (!layer.appearance.visible) {
        vectorLayer.set('visible', false);
      }
      vectorLayer.set('staticImageUrl', layer.staticImageUrl);
      vectorLayer.set('previewImageRequestUrl', layer.previewImageRequestUrl);

      return vectorLayer;
    }

    if (layer.source.type === 'WMTS') {
      const {
        attribution,
        visible,
        opacity,
        hoverable,
        hoverTemplate,
        legendUrl
      } = layer.appearance;

      const wmtsTileGrid = new OlTileGridWMTS({
        origin: layer.source.tileGrid.origin,
        resolutions: layer.source.tileGrid.resolutions,
        matrixIds: layer.source.tileGrid.matrixIds
      });

      const wmtsSource = new OlSourceWMTS({
        projection: layer.source.projection,
        urls: [
          layer.source.url
        ],
        layer: layer.source.layerNames,
        format: layer.source.format,
        matrixSet: layer.source.tileMatrixSet,
        attributions: [attribution],
        tileGrid: wmtsTileGrid,
        style: layer.source.style,
        requestEncoding: layer.source.requestEncoding
      });

      const tileLayer = new OlTileLayer({
        source: wmtsSource,
        visible: visible,
        opacity: opacity
      });

      tileLayer.set('name', layer.name);
      tileLayer.set('hoverable', hoverable);
      tileLayer.set('hoverTemplate', hoverTemplate);
      tileLayer.set('type', 'WMTS');
      tileLayer.set('legendUrl', legendUrl);
      tileLayer.set('isBaseLayer', layer.isBaseLayer);
      tileLayer.set('isDefault', layer.isDefault);
      tileLayer.set('topic', layer.topic);
      tileLayer.set('staticImageUrl', layer.staticImageUrl);
      tileLayer.set('convertFeatureInfoValue', layer.convertFeatureInfoValue || false);
      tileLayer.set('previewImageRequestUrl', layer.previewImageRequestUrl);
      tileLayer.set('timeFormat', layer.source.timeFormat);
      tileLayer.set('description', layer.description);
      tileLayer.set('metadataIdentifier', layer.metadataIdentifier);
      tileLayer.set('displayColumns', layer.displayColumns);
      tileLayer.set('columnAliasesDe', layer.columnAliasesDe);
      tileLayer.set('columnAliasesEn', layer.columnAliasesEn);
      tileLayer.set('legendUrl', layer.legendUrl);
      tileLayer.set('searchable', layer.searchable);
      tileLayer.set('searchConfig', layer.searchConfig);

      return tileLayer;
    }

    if (layer.source.type === 'ImageWMS') {
      return this.parseImageLayer(layer);
    }

    if (['TileWMS', 'WMSTime'].indexOf(layer.source.type) > -1) {
      return this.parseTileLayer(layer);
    }
  }

  /**
   * Parses an array of maplayer objects and returns an array of ol.layer.Layers.
   *
   * @param {Array} mapLayerObjArray An array of layerObjects like we get them
   *                                 from the backend.
   * @return {Array} An array of ol.layer.Layer.
   */
  parseLayers(mapLayerObjArray: object[]) {
    const layers: OlLayer[] = [];

    if (isEmpty(mapLayerObjArray)) {
      return layers;
    }

    mapLayerObjArray.forEach((layerObj: any) => {
      layers.push(this.parseLayer(layerObj));
    });

    reverse(layers);

    return layers;
  }

  /**
   * Parse and create a tile layer.
   * @return {ol.layer.Tile} the new layer
   */
  parseTileLayer(layerObj: any) {
    const {
      url,
      layerNames,
      crossOrigin,
      requestWithTiled,
      timeFormat,
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

    const defaultFormat = timeFormat || 'YYYY-MM-DD';

    const tileGridObj = ObjectUtil.getValue('tileGrid', layerObj.source);

    let tileGrid;
    if (tileGridObj) {
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
    }

    const layerSource = new OlTileWMS({
      url: url,
      attributions: attribution,
      tileGrid: tileGrid,
      params: {
        'LAYERS': layerNames,
        'TILED': requestWithTiled || false,
        'TRANSPARENT': true
      },
      crossOrigin: crossOrigin
    });

    if (type === 'WMSTime') {
      layerSource.getParams().TIME = moment(moment.now()).format(defaultFormat);
    }

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
    tileLayer.set('isDefault', layerObj.isDefault);
    tileLayer.set('topic', layerObj.topic);
    tileLayer.set('staticImageUrl', layerObj.staticImageUrl);
    tileLayer.set('previewImageRequestUrl', layerObj.previewImageRequestUrl);
    tileLayer.set('timeFormat', defaultFormat);
    tileLayer.set('description', layerObj.description);
    tileLayer.set('displayColumns', layerObj.displayColumns);
    tileLayer.set('columnAliasesDe', layerObj.columnAliasesDe);
    tileLayer.set('columnAliasesEn', layerObj.columnAliasesEn);
    tileLayer.set('legendUrl', layerObj.legendUrl);
    tileLayer.set('searchable', layerObj.searchable);
    tileLayer.set('searchConfig', layerObj.searchConfig);

    if (type === 'WMSTime') {
      const startDate = layerObj.startDate ? moment(layerObj.startDate).format(defaultFormat) : undefined;
      const endDate = layerObj.endDate ? moment(layerObj.endDate).format(defaultFormat) : undefined;
      tileLayer.set('startDate', startDate);
      tileLayer.set('endDate', endDate);
    }
    tileLayer.set('convertFeatureInfoValue', layerObj.convertFeatureInfoValue || false);
    tileLayer.set('metadataIdentifier', layerObj.metadataIdentifier);
    return tileLayer;
  }

  /**
   * Parse and create a single tile WMS layer.
   * @return {ol.layer.Image} the new layer
   */
  parseImageLayer(layerObj: any) {
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
    imageLayer.set('isDefault', layerObj.isDefault);
    imageLayer.set('topic', layerObj.topic);
    imageLayer.set('staticImageUrl', layerObj.staticImageUrl);
    imageLayer.set('previewImageRequestUrl', layerObj.previewImageRequestUrl);
    imageLayer.set('convertFeatureInfoValue', layerObj.convertFeatureInfoValue || false);
    imageLayer.set('description', layerObj.description);
    imageLayer.set('metadataIdentifier', layerObj.metadataIdentifier);
    imageLayer.set('displayColumns', layerObj.displayColumns);
    imageLayer.set('columnAliasesDe', layerObj.columnAliasesDe);
    imageLayer.set('columnAliasesEn', layerObj.columnAliasesEn);
    imageLayer.set('legendUrl', layerObj.legendUrl);
    imageLayer.set('searchable', layerObj.searchable);
    imageLayer.set('searchConfig', layerObj.searchConfig);

    return imageLayer;
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
  getToolsForToolbar(activeModules: Array<any>, map: any,
    appContext: any, t: (arg: string) => string, config?: any) {
    const tools: any[] = [];
    const mapConfig = ObjectUtil.getValue('mapConfig', appContext);
    const isMobileClient = isMobile();

    activeModules.forEach((module: any) => {
      if (module.hidden) {
        return;
      }
      switch (module.xtype) {
        case 'basigx-button-zoomin':
          tools.push(<ZoomButton
            delta={1}
            map={map}
            key="1"
            type="primary"
            shape="circle"
            iconName="fas fa-plus"
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
            iconName="fas fa-minus"
            tooltip={t('ZoomOut.tooltip')}
            tooltipPlacement={'right'}
          />);
          return;
        case 'shogun-button-zoomtoextent':
          tools.push(<ZoomToExtentButton
            center={[
              mapConfig.center.x,
              mapConfig.center.y
            ]}
            zoom={mapConfig.zoom}
            map={map}
            key="3"
            type="primary"
            shape="circle"
            iconName="fas fa-expand"
          />);
          return;
        case 'shogun-button-print':
          tools.push(<PrintButton
            map={map}
            key="4"
            type="primary"
            shape="circle"
            iconName="fas fa-print"
            config={config}
            tooltip={t('PrintPanel.windowTitle')}
            tooltipPlacement={'right'}
            printScales={this.getMapScales(mapConfig.resolutions)}
            t={t}
          />);
          return;
        case 'basigx-button-hsi':
          tools.push(<HsiButton
            map={map}
            key="5"
            tooltip={t('FeatureInfo.tooltip')}
            tooltipPlacement={'right'}
            t={t}
            getInfoByClick={isMobileClient}
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
    return tools.sort((a, b) => {
      if (a.key < b.key) {
        return -1;
      }
      if (a.key > b.key) {
        return 1;
      }
      return 0;
    });
  }

  measureToolsEnabled(activeModules: Array<any>) {
    return activeModules.map((module: any) =>
      module.xtype === 'shogun-button-showmeasuretoolspanel').indexOf(true) > -1;
  }

}

export default Shogun2AppContextUtil;
