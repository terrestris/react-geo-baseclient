/*eslint-env jest*/
import OlImageWmsSource from 'ol/source/ImageWMS';
import OlVectorSource from 'ol/source/Vector';
import OlVectorLayer from 'ol/layer/Vector';
import OlImageLayer from 'ol/layer/Image';

import TestUtils from '../../../spec/TestUtils';

import PrintUtil from './PrintUtil.js';

describe('<PrintUtil />', () => {

  let map: any;

  let printExtentLayer = new OlVectorLayer({
    source: new OlVectorSource(),
    name: 'printExtentLayer'
  });

  let reactGeoLayer = new OlVectorLayer({
    source: new OlVectorSource(),
    name: 'react-geo-test-layer'
  });

  let invisibleLayer = new OlImageLayer({
    source: new OlImageWmsSource({
      url: 'http://url.de'
    }),
    name: 'I am not visible',
    visible: false
  });

  let printableLayer = new OlImageLayer({
    source: new OlImageWmsSource({
      url: 'http://url.de',
      attributions: 'abcderf'
    }),
    name: 'printMe'
  });

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

        let got = PrintUtil.getPrintableLayers(map, printExtentLayer);

        expect(got).toBeInstanceOf(Array);
        expect(got.length).toBe(1);
        expect(got[0]).toEqual(printableLayer);
      });
    });

    describe ('#getAttributions', () => {

      it ('returns string containing attribution of printable layers', () => {

        let got = PrintUtil.getAttributions(map, printExtentLayer);

        expect(got).toBe('abcderf');
      });
    });
  });
});
