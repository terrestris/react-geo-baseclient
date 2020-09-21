/* eslint-env jest*/
import OlImageWmsSource from 'ol/source/ImageWMS';
import OlImageLayer from 'ol/layer/Image';

// This causes issues via rbush depency
// import OlSourceVector from 'ol/source/Vector';

import TestUtils from '../../../config/jest/spec/TestUtils';

import PrintUtil from './PrintUtil';

describe('<PrintUtil />', () => {

  let map: any;

  const printExtentLayer = TestUtils.createTileLayer({});
  printExtentLayer.set('name', 'printExtentLayer');

  const reactGeoLayer = TestUtils.createTileLayer({});
  reactGeoLayer.set('name', 'react-geo-test-layer');

  const invisibleLayer = new OlImageLayer({
    source: new OlImageWmsSource({
      url: 'http://url.de',
      params: undefined,
      projection: undefined
    }),
    visible: false
  });
  invisibleLayer.set('name', 'I am not visible');

  const printableLayer = new OlImageLayer({
    source: new OlImageWmsSource({
      url: 'http://url.de',
      attributions: 'abcderf',
      params: undefined,
      projection: undefined
    })
  });
  printableLayer.set('name', 'printMe');

  /**
   * Adds layers to map.
   */
  const addLayersToMap = () => {
    map.addLayer(printExtentLayer);
    map.addLayer(reactGeoLayer);
    map.addLayer(invisibleLayer);
    map.addLayer(printableLayer);
  };


  describe('Basics', () => {
    it('is defined', () => {
      expect(PrintUtil).not.toBeUndefined();
    });
  });

  beforeEach(() => {
    map = TestUtils.createMap({});
    addLayersToMap();
  });

  afterEach(() => {
    TestUtils.removeMap(map);
  });

  describe('Static methods', () => {

    describe ('#getPrintableLayers', () => {

      it ('returns filtered array of printable layers', () => {

        const got = PrintUtil.getPrintableLayers(map, printExtentLayer);

        expect(got).toBeInstanceOf(Array);
        expect(got.length).toBe(1);
        expect(got[0]).toEqual(printableLayer);
      });
    });

    describe ('#getAttributions', () => {

      it ('returns string containing attribution of printable layers', () => {

        const got = PrintUtil.getAttributions(map, printExtentLayer);

        expect(got).toBe('abcderf');
      });
    });
  });
});
