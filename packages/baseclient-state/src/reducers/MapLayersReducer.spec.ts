/*eslint-env jest*/
import reducer from './MapLayersReducer';
const initialState: any[] = [];
import {
  SET_LAYERS,
  ADD_LAYERS,
  CHANGE_LAYER_VISIBILITY
  // REMOVE_LAYERS
} from '../constants/MapLayerChange';


describe('MapViewReducer', () => {
  const testLayers = [
    {
      "id": 17,
      "name": "OSM-WMS",
      "description": null,
      "source": {
        "id": 14,
        "name": null,
        "type": "TileWMS",
        "url": "http://ows.terrestris.de/osm/service?",
        "width": 256,
        "height": 256,
        "version": "1.1.0",
        "layerNames": "OSM-WMS",
        "layerStyles": "",
        "tileGrid": {
          "id": 13,
          "type": "TileGrid",
          "tileGridOrigin": {
            "x": 0.0,
            "y": 0.0
          },
          "tileGridExtent": {
            "id": 12,
            "lowerLeft": {
              "x": -2.002637639E7,
              "y": -2.00489661E7
            },
            "upperRight": {
              "x": 2.002637639E7,
              "y": 2.00489661E7
            }
          },
          "tileSize": 256,
          "tileGridResolutions": [156543.03390625, 78271.516953125, 39135.7584765625, 19567.87923828125, 9783.939619140625, 4891.9698095703125, 2445.9849047851562, 1222.9924523925781, 611.4962261962891, 305.74811309814453, 152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135]
        }
      },
      "appearance": {
        "id": 16,
        "attribution": "© <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a> <br>",
        "hoverable": null,
        "hoverTemplate": null,
        "properties": {},
        "name": null,
        "maxResolution": 156543.03390625,
        "minResolution": 0.5971642833948135,
        "opacity": 1.0,
        "visible": true
      }
    }, {
      "id": 18,
      "name": "OSM-WMS GRAY",
      "description": null,
      "source": {
        "id": 15,
        "name": null,
        "type": "TileWMS",
        "url": "http://ows.terrestris.de/osm-gray/service?",
        "width": 256,
        "height": 256,
        "version": "1.1.0",
        "layerNames": "OSM-WMS",
        "layerStyles": "",
        "tileGrid": {
          "id": 13,
          "type": "TileGrid",
          "tileGridOrigin": {
            "x": 0.0,
            "y": 0.0
          },
          "tileGridExtent": {
            "id": 12,
            "lowerLeft": {
              "x": -2.002637639E7,
              "y": -2.00489661E7
            },
            "upperRight": {
              "x": 2.002637639E7,
              "y": 2.00489661E7
            }
          },
          "tileSize": 256,
          "tileGridResolutions": [156543.03390625, 78271.516953125, 39135.7584765625, 19567.87923828125, 9783.939619140625, 4891.9698095703125, 2445.9849047851562, 1222.9924523925781, 611.4962261962891, 305.74811309814453, 152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135]
        }
      },
      "appearance": {
        "id": 16,
        "attribution": "© <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a> <br>",
        "hoverable": null,
        "hoverTemplate": null,
        "properties": {},
        "name": null,
        "maxResolution": 156543.03390625,
        "minResolution": 0.5971642833948135,
        "opacity": 1.0,
        "visible": true
      }
    }
  ];
  const firstLayer = testLayers[0];
  // const testLayersAsOlLayers = AppContextUtil.parseLayers(testLayers).reverse();

  it('returns the initial state if an empty action is supplied', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('handles SET_LAYERS for an empty array of layers', () => {
    const setLayersAction = {
      type: SET_LAYERS,
      layerObjects: testLayers
    };
    expect(reducer([], setLayersAction)).toEqual(testLayers);
  });

  it('handles SET_LAYERS for an unempty array of layers (overwrite existing array)', () => {
    const setLayersAction = {
      type: SET_LAYERS,
      layerObjects: testLayers
    };
    expect(reducer([firstLayer], setLayersAction)).toEqual(testLayers);
  });

  it('handles ADD_LAYERS for an empty array of layers', () => {
    const addLayersAction = {
      type: ADD_LAYERS,
      layerObjects: [testLayers]
    };
    expect(reducer([], addLayersAction)).toEqual([testLayers]);
  });

  it('handles ADD_LAYERS for an already filled array of layers', () => {
    const addLayersAction = {
      type: ADD_LAYERS,
      layerObjects: [firstLayer]
    };
    const layersToBeAfter = [firstLayer, ...testLayers];
    expect(reducer(testLayers, addLayersAction)).toEqual(layersToBeAfter);
  });

  it('handles CHANGE_LAYER_VISIBILITY', () => {
    const visibilityToBeSet = !firstLayer.appearance.visible;
    const changeLayersVisibilityAction = {
      type: CHANGE_LAYER_VISIBILITY,
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

  // it('handles REMOVE_LAYERS for empty map layers array', () => {
  //   const updateLayerOrderingAction = {
  //     type: REMOVE_LAYERS,
  //     layers: AppContextUtil.parseLayers([firstLayer])
  //   };
  //   const mapLayersAfter: any[] = [];
  //   expect(reducer([], updateLayerOrderingAction)).toEqual(mapLayersAfter);
  // });

  // it('handles REMOVE_LAYERS for filled map layers array', () => {
  //   const updateLayerOrderingAction = {
  //     type: actions.REMOVE_LAYERS,
  //     layers: AppContextUtil.parseLayers([firstLayer])
  //   };
  //   const mapLayersToBefore = [firstLayer, ...testLayers];
  //   expect(reducer(mapLayersToBefore, updateLayerOrderingAction)).toEqual(testLayers);
  // });
});
