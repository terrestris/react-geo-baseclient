import {
  defaults as OlDefaultControls
} from 'ol/control';
// import OlLayerGroup from 'ol/layer/Group';
import OlMap from 'ol/Map';
import {
  get as OlGetProjection
} from 'ol/proj';
import OlTileWMS from 'ol/source/TileWMS';
import OlTileLayer from 'ol/layer/Tile';
import OlImageWMS from 'ol/source/ImageWMS';
import OlImageLayer from 'ol/layer/Image';
import OlTileGrid from 'ol/tilegrid/TileGrid';
import OlView from 'ol/View';
import OlFeature from 'ol/feature';
import OlLayerGroup from 'ol/layer/Group';
import OlInteraction from 'ol/interaction/interaction';
import OlScaleLine from 'ol/control/ScaleLine';
import OlLayer from 'ol/layer/base';
import ObjectUtil from '@terrestris/base-util/src/ObjectUtil/ObjectUtil';
import FeatureUtil from '@terrestris/ol-util/src/FeatureUtil/FeatureUtil';
import ProjectionUtil from '@terrestris/ol-util/src/ProjectionUtil/ProjectionUtil';
// import MeasureUtil from '@terrestris/ol-util/src/MeasureUtil/MeasureUtil';
import { reverse, unionWith, isEqual, find, isEmpty } from 'lodash';

import config from '../config/config';
import Logger from '@terrestris/base-util';

/**
 * Helper Class for the ol3 map.
 *
 * @class
 */
export class MapUtils {

  /**
   * TODO Fill via public configuration interface.
   *
   * @return {Array} The list of supported GeoServer namespaces.
   */
  static getSupportedNamespaces() {
    return [
      'localdetect'
    ];
  }

  /**
   * The setupMap function
   *
   * Creates the Openlayers map from the initial state.
   *
   * @method setupMap
   * @return {OlMap} The openlayers map.
   */
  static setupMap = (state: any) => {
    // TODO, fix nex syntax of util methods
    // ProjectionUtil.initProj4Definitions();
    // ProjectionUtil.initProj4DefinitionMappings();
    const mapViewConfig = state.mapView.present;
    const mapLayers = state.mapLayers;
    const {
      center,
      zoom,
      projection,
      resolutions,
      mapExtent
    } = mapViewConfig;

    let olProjection;
    if (projection) {
      olProjection = OlGetProjection(projection);
      olProjection.setExtent(mapExtent);
    }

    let mapView = new OlView({
      center: center,
      zoom: zoom,
      projection: olProjection,
      resolutions: resolutions
    });

    let map = new OlMap({
      //target: 'map',
      view: mapView,
      keyboardEventTarget: document,
      controls: OlDefaultControls({
        zoom: false,
        attributionOptions: {
          collapsible: true
        }
      }).extend([
        new OlScaleLine()
      ]),
      layers: mapLayers
    });

    return map;
  };


  /**
   * Returns all interactions by the given name of a map.
   *
   * @param {ol.Map} map The map to use for lookup.
   * @param {String} name The name of the interaction to look for.
   * @return {ol.interaction[]} The list of result interactions.
   */
  static getInteractionsByName(map: OlMap, name: string) {
    let interactionCandidates: any[] = [];

    if (!(map instanceof OlMap)) {
      Logger.debug('Input parameter map must be from type `ol.Map`.');
      return interactionCandidates;
    }

    let interactions = map.getInteractions();

    interactions.forEach(function(interaction: OlInteraction) {
      if (interaction.get('name') === name) {
        interactionCandidates.push(interaction);
      }
    });

    return interactionCandidates;
  }

  /**
   * Returns all interactions by the given name of a map.
   *
   * @param {ol.Map} map The map to use for lookup.
   * @param {ol.interaction} clazz The class of the interaction to look for.
   * @return {ol.interaction[]} The list of result interactions.
   */
  static getInteractionsByClass(map: OlMap, clazz: any) {
    let interactionCandidates: OlInteraction[] = [];

    if (!(map instanceof OlMap)) {
      Logger.debug('Input parameter map must be from type `ol.Map`.');
      return interactionCandidates;
    }

    let interactions = map.getInteractions();

    interactions.forEach(function(interaction: OlInteraction) {
      if (interaction instanceof clazz) {
        interactionCandidates.push(interaction);
      }
    });

    return interactionCandidates;
  }


  /**
   * Parses an array of bismaplayers and returns an array of ol.layer.Layers.
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
      if (layerObj.source.type !== 'TileWMS' &&
          layerObj.source.type !==  'WMSTime') {
        Logger.warn('Currently only TileWMS layers are supported.');
      }
      let tileGridObj = ObjectUtil.getValue('tileGrid', layerObj.source);
      let tileGrid = find(tileGrids,function(o) {
        return isEqual(o.getTileSize()[0], tileGridObj.tileSize) &&
          isEqual(o.getTileSize()[1], tileGridObj.tileSize);
      });

      if (!tileGrid && tileGridObj) {
        tileGrid = new OlTileGrid({
          resolutions: tileGridObj.tileGridResolutions,
          tileSize: [tileGridObj.tileSize, tileGridObj.tileSize],
          // origin: [180000, 5260000] // TODO check for already cached layers (e.g. BIS_FLURSTUECK)
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
        layers.push(MapUtils.parseTileLayer(layerObj, tileGrid));
      }

      if (layerObj.source.type === 'WMSTime') {
        layers.push(MapUtils.parseImageLayer(layerObj));
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
        // 'TILED': layerObj.source.requestWithTiled // TODO
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

  /**
   * Returns all layers of a collection. Even the hidden ones.
   *
   * @param {ol.Map|ol.layer.Group} collection The collection to get the layers
   *                                           from. This can be an ol.layer.Group
   *                                           or and ol.Map.
   * @return {Array} An array of all Layers.
   */
  static getAllLayers(collection: any) {
    if (!(collection instanceof OlMap) && !(collection instanceof OlLayerGroup)) {
      Logger.error('Input parameter collection must be from type `ol.Map`' +
        'or `ol.layer.Group`.');
    }

    var layers = collection.getLayers().getArray();
    var allLayers: any[] = [];

    layers.forEach(function(layer: any) {
      if (layer instanceof OlLayerGroup) {
        MapUtils.getAllLayers(layer).forEach((layeri) => {
          allLayers.push(layeri);
        });
      }
      allLayers.push(layer);
    });
    return allLayers;
  }

  /**
   * Get all Layers from a given layerset (bismaptreefolder).
   *
   * @async
   * @static
   * @param {Object} layerset A treefolder object
   * @returns {Promise} A promise containg an array of layerObjects.
   */
  static layersFromLayerset(layerset: any) {
    const layers = layerset.children;
    let requestPath = config.layerPath + '/filter?';
    const params = layers.map((layer: any) => {
      return `id=${layer.layer}`;
    }).join('&');
    return fetch(requestPath + params)
      .then((response) => response.json());
  }

  /**
   * Get a layer by its key (ol_uid).
   *
   * @param {ol.Map} map The map to use for lookup.
   * @param {String} ol_uid The ol_uid of a layer.
   * @return {ol.layer.Layer} The layer.
   */
  static getLayerByOlUid = (map: OlMap, ol_uid: string) => {
    const layers = MapUtils.getAllLayers(map);
    const layer = layers.find((l) => {
      return ol_uid === l.ol_uid.toString();
    });
    return layer;
  }

  /**
   * Returns the layer from the provided map by the given name
   * (parameter LAYERS).
   *
   * @param {ol.Map} map The map to use for lookup.
   * @param {String} name The name to get the layer by.
   * @return {ol.Layer} The result layer or undefined if the layer could not
   *                    be found.
   */
  static getLayerByName(map: OlMap, name: string) {
    let layers = MapUtils.getMapLayers(map);
    let layerCandidate;

    for (let layer of layers) {
      if (layer.getSource &&
        layer.getSource().getParams &&
        layer.getSource().getParams()['LAYERS'] === name) {
        layerCandidate = layer;
        break;
      }
    }

    return layerCandidate;
  }


  /**
   * Returns the layer from the provided map by the given feature.
   *
   * @param {ol.Map} map The map to use for lookup.
   * @param {ol.Feature} feature The feature to get the layer by.
   * @return {ol.Layer} The result layer or undefined if the layer could not
   *                    be found.
   */
  static getLayerByFeature(map: OlMap, feature: OlFeature) {
    let featureTypeName = FeatureUtil.getFeatureTypeName(feature);
    let namespaces = MapUtils.getSupportedNamespaces();
    let layerCandidate;

    for (let namespace of namespaces) {
      let qualifiedFeatureTypeName = `${namespace}:${featureTypeName}`;
      let layer = MapUtils.getLayerByName(map, qualifiedFeatureTypeName);
      if (layer) {
        layerCandidate = layer;
        break;
      }
    }

    return layerCandidate;
  }

  /**
   * Returns all layers of the specified layer group recursively.
   *
   * @param {ol.Map} map The map to use for lookup.
   * @param {ol.Layer.Group} layerGroup The group to flatten.
   * @return {Array} The (flattened) layers from the group
   */
  static getLayersByGroup(map: OlMap, layerGroup: any) {
    let layerCandidates: any[] = [];

    layerGroup.getLayers().forEach((layer: any) => {
      if (layer instanceof OlLayerGroup) {
        layerCandidates.push(...MapUtils.getLayersByGroup(map, layer));
      } else {
        layerCandidates.push(layer);
      }
    });

    return layerCandidates;
  }

  /**
   * Returns all layers of the provided map.
   *
   * @param {ol.Map} map The map to use for lookup.
   * @return {Array} An array of all map layers.
   */
  static getMapLayers(map: OlMap) {
    return MapUtils.getLayersByGroup(map, map.getLayerGroup());
  }
}

export default MapUtils;
