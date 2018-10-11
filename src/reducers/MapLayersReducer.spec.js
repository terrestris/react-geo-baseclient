/*eslint-env jest*/
import reducer from './MapLayersReducer';
import * as actions from '../../src/actions/MapLayerChangeAction';
import MapUtils from '../../src/util/MapUtils';
import appContext from '../resources/appContext.json';
const get = require('lodash/get');
const head = require('lodash/head');
const tail = require('lodash/tail');
const initialState = [];

describe('MapViewReducer', () => {
  const testLayers = tail(get(appContext, 'viewport.subModules[0].mapLayers'));
  const firstLayer = head(get(appContext, 'viewport.subModules[0].mapLayers'));
  // const testLayersAsOlLayers = MapUtils.parseLayers(testLayers).reverse();

  it('returns the initial state if an empty action is supplied', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('handles SET_LAYERS for an empty array of layers', () => {
    const setLayersAction = {
      type: actions.SET_LAYERS,
      layerObjects: testLayers
    };
    expect(reducer([], setLayersAction)).toEqual(testLayers);
  });

  it('handles SET_LAYERS for an unempty array of layers (overwrite existing array)', () => {
    const setLayersAction = {
      type: actions.SET_LAYERS,
      layerObjects: testLayers
    };
    expect(reducer([firstLayer], setLayersAction)).toEqual(testLayers);
  });

  it('handles ADD_LAYERS for an empty array of layers', () => {
    const addLayersAction = {
      type: actions.ADD_LAYERS,
      layerObjects: [testLayers]
    };
    expect(reducer([], addLayersAction)).toEqual([testLayers]);
  });

  it('handles ADD_LAYERS for an already filled array of layers', () => {
    const addLayersAction = {
      type: actions.ADD_LAYERS,
      layerObjects: [firstLayer]
    };
    // console.log(testLayers);
    const layersToBeAfter = [firstLayer, ...testLayers];
    expect(reducer(testLayers, addLayersAction)).toEqual(layersToBeAfter);
  });

  it('handles CHANGE_LAYER_VISIBILITY', () => {
    const visibilityToBeSet = !firstLayer.appearance.visible;
    const changeLayersVisibilityAction = {
      type: actions.CHANGE_LAYER_VISIBILITY,
      visibility: visibilityToBeSet,
      shogunLayerId: firstLayer.id
    };
    const mapLayersAfter = reducer([firstLayer], changeLayersVisibilityAction);
    expect(mapLayersAfter[0].appearance.visible).toBe(visibilityToBeSet);
  });

  // it('handles UPDATE_LAYER_ORDERING', () => {
  //   const updateLayerOrderingAction = {
  //     type: actions.UPDATE_LAYER_ORDERING,
  //     mapLayers: testLayersAsOlLayers
  //   };
  //   const mapLayersAfter = testLayers.map(t=>t).reverse();
  //   expect(reducer(testLayers, updateLayerOrderingAction)).toEqual(mapLayersAfter);
  // });

  it('handles REMOVE_LAYERS for empty map layers array', () => {
    const updateLayerOrderingAction = {
      type: actions.REMOVE_LAYERS,
      layers: MapUtils.parseLayers([firstLayer])
    };
    const mapLayersAfter = [];
    expect(reducer([], updateLayerOrderingAction)).toEqual(mapLayersAfter);
  });

  // it('handles REMOVE_LAYERS for filled map layers array', () => {
  //   const updateLayerOrderingAction = {
  //     type: actions.REMOVE_LAYERS,
  //     layers: MapUtils.parseLayers([firstLayer])
  //   };
  //   const mapLayersToBefore = [firstLayer, ...testLayers];
  //   expect(reducer(mapLayersToBefore, updateLayerOrderingAction)).toEqual(testLayers);
  // });
});
