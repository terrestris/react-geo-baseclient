import * as React from 'react';

import OlTileWMS from 'ol/source/TileWMS';
import OlTileLayer from 'ol/layer/Tile';
import OlImageWMS from 'ol/source/ImageWMS';
import OlSourceWMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import OlImageLayer from 'ol/layer/Image';
import OlLayerBase from 'ol/layer/Base';
import OlLayerGroup from 'ol/layer/Group';
import OlTileGrid from 'ol/tilegrid/TileGrid';
import OlWMTSCapabilities from 'ol/format/WMTSCapabilities';
import { fromLonLat } from 'ol/proj';

import * as moment from 'moment';

const union = require('lodash/union');

import isMobile from 'is-mobile';

import ZoomButton from '@terrestris/react-geo/dist/Button/ZoomButton/ZoomButton';
import ZoomToExtentButton from '@terrestris/react-geo/dist/Button/ZoomToExtentButton/ZoomToExtentButton';
import MeasureButton from '@terrestris/react-geo/dist/Button/MeasureButton/MeasureButton';

import Logger from '@terrestris/base-util/dist/Logger';
import ObjectUtil from '@terrestris/base-util/dist/ObjectUtil/ObjectUtil';
import { UrlUtil } from '@terrestris/base-util/dist/UrlUtil/UrlUtil';

import initialState from '../../state/initialState';

import PrintButton from '../../component/button/PrintButton/PrintButton';
import MeasureMenuButton from '../../component/button/MeasureMenuButton/MeasureMenuButton';
import HsiButton from '../../component/button/HsiButton/HsiButton';

import Application from '../../model/Application';
import Layer from '../../model/Layer';

import LayerService from '../../service/LayerSerivce/LayerService';
import AppInfoService from '../../service/AppInfoService/AppInfoService';
import UserService from '../../service/UserService/UserService';

import BaseAppContextUtil, { AppContextUtil } from './BaseAppContextUtil';

const layerService = new LayerService();
const appInfoService = new AppInfoService();
const userService = new UserService();

/**
 * This class provides some methods which can be used with the appContext of SHOGun-Boot.
 */
class ShogunBootAppContextUtil extends BaseAppContextUtil implements AppContextUtil {

  canReadCurrentAppContext() {
    const appMode = typeof (APP_MODE) != 'undefined' ? APP_MODE : '';

    return appMode.indexOf('boot') > -1;
  }

  /**
   * This method parses an appContext object as delivered by SHOGun-Boot and returns
   * an storeObject as expected by the redux store.
   * @param {Object} appContext The appContext.
   * @return {Object} The initialState used by the store.
   */
  async appContextToState(appContext: Application) {

    const state: any = initialState;

    // appInfo
    state.appInfo = await appInfoService.getAppInfo();

    // userInfo
    state.userInfo = await userService.findOne(state.appInfo.userId);

    if (appContext) {
      const mapConfig = appContext.clientConfig.mapView;
      const activeModules = appContext.toolConfig;
      const defaultTopic = '';
      const layerTree = appContext.layerTree;

      // mapView
      const projection = mapConfig.projection.indexOf('EPSG:') < 0 ?
        'EPSG:' + mapConfig.projection :
        mapConfig.projection;

      state.mapView.present.projection = projection;

      state.mapView.present.center = fromLonLat([mapConfig.center[0], mapConfig.center[1]], projection);

      const ll = fromLonLat([mapConfig.extent[0], mapConfig.extent[1]], projection);
      const ur = fromLonLat([mapConfig.extent[2], mapConfig.extent[3]], projection);

      state.mapView.present.mapExtent = [ll[0], ll[1], ur[0], ur[1]];

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

      state.appInfo.appName = appContext.name;

      state.appContext = appContext;
    }

    return state;
  }

  /**
   * TODO add config file for background layers
   */
  getBackgroundLayers(): OlLayerTile[] {
    return [
      new OlLayerTile({
        source: new OlSourceStamen({
          layer: 'watercolor'
        })
      }),
      new OlLayerTile({
        source: new OlSourceOsm()
      })
    ];
  }

  async parseLayertree(folder: any) {
    const nodes = await this.parseNodes(folder.children);
    const tree = new OlLayerGroup({
      layers: nodes.reverse(),
      visible: folder.checked,
    });
    return tree;
  }

  async parseNodes(nodes: any[]) {
    const collection: OlLayer[] = [];

    for (const node of nodes) {
      if (node.children) {
        collection.push(await this.parseFolder(node));
      } else {
        const layer: Layer = await layerService.findOne(node.layerId);

        const olLayer = await this.parseLayer(layer);

        olLayer.setVisible(node.checked);

        collection.push(olLayer);
      }
    }

    return collection;
  }

  async parseFolder(el: any) {
    const layers = await this.parseNodes(el.children);
    const folder = new OlLayerGroup({
      layers: layers.reverse(),
      visible: el.checked
    });
    folder.set('name', el.title);
    return folder;
  }

  /**
   * Parses an array of maplayer objects and returns an array of ol.layer.Layers.
   *
   * @param {Array} mapLayerObjArray An array of layerObjects like we get them
   *                                 from the backend.
   * @return {Array} An array of ol.layer.Layer.
   */
  async parseLayer(layer: Layer): Promise<OlLayerBase> {
    let olLayer: OlLayerBase;

    if ([
      'ImageWMS',
      'TileWMS',
      'WMTS',
      'WMSTime'
    ].indexOf(layer.type) < 0) {
      Logger.warn('Currently only TileWMS, ImageWMS, WMSTime and OSMVectortiles layers are supported.');
    }

    if (layer.type === 'WMTS') {
      olLayer = await this.parseWMTSLayer(layer);
    }

    if (layer.type === 'WMS') {
      olLayer = this.parseImageLayer(layer);
    }

    if (layer.type === 'TILEWMS') {
      olLayer = this.parseTileLayer(layer);
    }

    return olLayer;
  }

  /**
   * Parse and create a tile layer.
   * @return {ol.layer.Tile} the new layer
   */
  parseTileLayer(layer: Layer) {
    const {
      url,
      layerNames,
      crossOrigin,
      requestWithTiled = true,
      transparent = true,
      attribution,
      timeFormat,
      type,
      legendUrl,
      startDate,
      endDate
      // tileSize = 512,
      // resolutions = [],
      // extent
    } = layer.sourceConfig;

    const {
      opacity,
      hoverable,
      hoverTemplate
    } = layer.clientConfig;

    const defaultFormat = timeFormat || 'YYYY-MM-DD';

    // const tileGrid = new OlTileGrid({
    //   resolutions: resolutions,
    //   tileSize: [tileSize, tileSize],
    //   extent: [
    //     extent[0],
    //     extent[1],
    //     extent[2],
    //     extent[3]
    //   ]
    // });

    const layerSource = new OlTileWMS({
      url: url,
      attributions: attribution,
      // tileGrid: tileGrid,
      params: {
        'LAYERS': layerNames,
        'TILED': requestWithTiled,
        'TRANSPARENT': transparent
      },
      crossOrigin: crossOrigin
    });

    if (type === 'WMSTime') {
      layerSource.getParams().TIME = moment(moment.now()).format(defaultFormat);
    }

    const tileLayer = new OlTileLayer({
      source: layerSource,
      opacity: opacity
    });

    tileLayer.set('name', layer.name);
    tileLayer.set('hoverable', hoverable);
    tileLayer.set('hoverTemplate', hoverTemplate);
    tileLayer.set('type', type);
    tileLayer.set('legendUrl', legendUrl);
    tileLayer.set('timeFormat', defaultFormat);

    if (type === 'WMSTime') {
      tileLayer.set('startDate', startDate ? moment(startDate).format(defaultFormat) : undefined);
      tileLayer.set('endDate', endDate ? moment(endDate).format(defaultFormat) : undefined);
    }

    return tileLayer;
  }

  /**
   * Parse and create a single tile WMS layer.
   * @return {ol.layer.Image} the new layer
   */
  parseImageLayer(layer: Layer) {
    const {
      attribution,
      legendUrl,
      url,
      layerNames,
    } = layer.sourceConfig;

    const {
      opacity,
      hoverable,
      hoverTemplate,
      crossOrigin,
    } = layer.clientConfig;

    const layerSource = new OlImageWMS({
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
      opacity: opacity
    });

    imageLayer.set('name', layer.name);
    imageLayer.set('hoverable', hoverable);
    imageLayer.set('hoverTemplate', hoverTemplate);
    imageLayer.set('type', layer.type);
    imageLayer.set('legendUrl', legendUrl);

    return imageLayer;
  }

  /**
   *
   * @param layer
   * @param map
   * @returns
   */
  async parseWMTSLayer(layer: Layer) {
    const {
      url,
      layerNames
    } = layer.sourceConfig || {};

    const {
      opacity
    } = layer.clientConfig || {};

    var parser = new OlWMTSCapabilities();

    // @ts-ignore
    // TODO Add WMTS to Service enum
    const capabilitiesUrl = UrlUtil.createValidGetCapabilitiesRequest(url, 'WMTS');

    const capabilitiesResponse = await fetch(capabilitiesUrl);
    const capabilitiesResponseText = await capabilitiesResponse.text();

    const capabilities = parser.read(capabilitiesResponseText);

    const options = optionsFromCapabilities(capabilities, {
      layer: layerNames,
      // TODO Should be configurable
      projection: 'EPSG:3857'
    });

    const wmtsSource = new OlSourceWMTS(options);

    const wmtsLayer = new OlTileLayer({
      source: wmtsSource,
      visible: false,
      opacity: opacity
    });

    wmtsLayer.set('name', layer.name);
    wmtsLayer.set('type', layer.type);

    return wmtsLayer;
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

export default ShogunBootAppContextUtil;
