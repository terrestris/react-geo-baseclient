import React from 'react';
import {
  mount,
  shallow
} from 'enzyme';

import configureMockStore from 'redux-mock-store';
import initialState from './initialState';
import thunkMiddleware from 'redux-thunk';

import OlView from 'ol/View';
import OlMap from 'ol/Map';
import OlSourceVector from 'ol/source/Vector';
import OlSourceTileWMS from 'ol/source/TileWMS';
import OlLayerVector from 'ol/layer/Vector';
import OlLayerTile from 'ol/layer/Tile';
import OlLayerGroup from 'ol/layer/Group';
import OlCollection from 'ol/Collection';
import MapBrowserEvent from 'ol/MapBrowserEvent.js';

/**
 * A set of some useful static helper methods.
 *
 * @class
 */
export class TestUtils {

  static mapDivId = 'map';
  static mapDivHeight = 256;
  static mapDivWidth = 256;

  /**
   * Mounts a component of the given class.
   *
   * @param {Class} Clazz The Components Clazz to render
   * @param {Object} props The props to be used.
   * @param {Object} context The context to be set.
   */
  static mountComponent(Clazz, props, context) {
    return mount(<Clazz {...props} />, {context});
  }

  /**
   * Shallows a component of the given class.
   *
   * @param {Class} Clazz The Components class to render.
   * @param {Object} props The props to be used.
   * @param {Object} context The context to be set.
   */
  static shallowComponent(Clazz, props, context) {
    return shallow(<Clazz {...props} />, { context });
  }

  /**
   * Shallows a component of the given class and connects it with the redux store.
   * @param {Class} Clazz The Components class to render.
   * @param {Object} props The props to be used.
   * @param {Object} context The context to be set.
   * @return {Component} The connected component.
   */
  static shallowConnectedComponent(Clazz, props, context) {
    const middlewares = [
      thunkMiddleware,
    ];
    const mockStore = configureMockStore(middlewares);
    props.store = mockStore(initialState);
    // We call .shallow() once to not return the i18n HOC
    // … and once more to receive the Component itself (I can't say why this is needed)
    return shallow(<Clazz {...props} />, { context }).shallow().shallow();
  }

  /**
   * Shallows a component of the given class and connects it with the redux store without diving into the component.
   * @param {Class} Clazz The Components class to render.
   * @param {Object} props The props to be used.
   * @param {Object} context The context to be set.
   * @return {Component} The connected component.
   */
  static shallowConnectedComponentRoot(Clazz, props, context) {
    const middlewares = [
      thunkMiddleware,
    ];
    const mockStore = configureMockStore(middlewares);
    props.store = mockStore(initialState);
    // We don't call .shallow() since we want the component methods to be accessable
    return shallow(<Clazz {...props} />, { context });
  }

  /**
   * Creates and applies a map <div> element to the body.
   *
   * @return {Element} The mounted <div> element.
   */
  static mountMapDiv() {
    var div = document.createElement('div');
    var style = div.style;

    style.position = 'absolute';
    style.left = '-1000px';
    style.top = '-1000px';
    style.width = TestUtils.mapDivWidth + 'px';
    style.height = TestUtils.mapDivHeight + 'px';
    div.id = TestUtils.mapDivId;

    document.body.appendChild(div);

    return div;
  }

  /**
   * Removes the map div element from the body.
   */
  static unmountMapDiv() {
    let div = document.querySelector(`div#${TestUtils.mapDivId}`);
    if (!div) {
      return;
    }
    let parent = div.parentNode;
    if (parent) {
      parent.removeChild(div);
    }
    div = null;
  }

  /**
   * Creates an ol map.
   *
   * @param {Object} mapOpts Additional options for the map to create.
   * @return {ol.Map} The ol map.
   */
  static createMap(mapOpts) {
    let targetDiv = TestUtils.mountMapDiv();

    let defaultMapOpts = {
      target: targetDiv,
      view: new OlView({
        center: [829729, 6708850],
        resolution: 560,
        resolutions: [
          560,
          280,
          140,
          70,
          28,
          14,
          7,
          2.8,
          1.4,
          0.7,
          0.28,
          0.14,
          0.028
        ]
      })
    };

    Object.assign(defaultMapOpts, mapOpts);

    let map = new OlMap(defaultMapOpts);

    map.renderSync();

    return map;
  }

  /**
   * Removes the map.
   */
  static removeMap(map) {
    if (map instanceof OlMap) {
      map.dispose();
    }
    TestUtils.unmountMapDiv();
  }

  /**
   * Simulates a browser pointer event on the map viewport.
   * Origin: https://github.com/openlayers/openlayers/blob/master/test/spec/ol/interaction/draw.test.js#L67
   *
   * @param {ol.Map} map The map to use.
   * @param {string} type Event type.
   * @param {number} x Horizontal offset from map center.
   * @param {number} y Vertical offset from map center.
   * @param {boolean} opt_shiftKey Shift key is pressed
   * @param {boolean} dragging Whether the map is being dragged or not.
   */
  static simulatePointerEvent(map, type, x, y, opt_shiftKey, dragging) {
    let viewport = map.getViewport();
    // Calculated in case body has top < 0 (test runner with small window).
    let position = viewport.getBoundingClientRect();
    let shiftKey = opt_shiftKey !== undefined ? opt_shiftKey : false;
    let event = new MapBrowserEvent(type, map, {
      clientX: position.left + x + TestUtils.mapDivWidth / 2,
      clientY: position.top + y + TestUtils.mapDivHeight / 2,
      shiftKey: shiftKey,
      dragging
    });
    map.handleMapBrowserEvent(event);
  }

  /**
   * Creates and returns an empty vector layer.
   *
   * @param {Object} properties The properties to set.
   * @return {ol.layer.Vector} The layer.
   */
  static createVectorLayer(properties) {
    let source = new OlSourceVector();
    let layer = new OlLayerVector({source: source});

    layer.setProperties(properties);

    return layer;
  }

  /**
   * Creates and returns a tile layer.
   *
   * @param {Object} properties The properties to set.
   * @return {ol.layer.Tile} The layer.
   */
  static createTileLayer(properties) {
    const source = new OlSourceTileWMS({
      url: 'https://ows.terrestris.de/osm/service',
      params: {
        'LAYERS': 'OSM-WMS',
        'TILED': true
      },
      serverType: 'geoserver'
    });
    const layer = new OlLayerTile({
      source: source
    });

    layer.setProperties(properties);

    return layer;
  }
}

export default TestUtils;