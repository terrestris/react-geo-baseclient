/* eslint-env jest*/
import TestUtils from '../../../../config/jest/spec/TestUtils';

import LayerSetBaseMapChooser from './LayerSetBaseMapChooser';

import OlLayerGroup from 'ol/layer/Group';
import OlImageLayer from 'ol/layer/Image';
import OlImageWMS from 'ol/source/ImageWMS';

describe('<LayerSetBaseMapChooser />', () => {
  let map;
  let wrapper: any;

  const layer = new OlImageLayer({
    source: new OlImageWMS({
      url: 'http://url.de',
      projection: 'EPSG:3857',
      params: {
        'LAYERS': 'ns:ftName',
        'TRANSPARENT': true
      }
    }),
    visible: true
  });

  beforeEach(() => {
    map = TestUtils.createMap({});
    wrapper = TestUtils.mountComponent(LayerSetBaseMapChooser, {
      t: () => {},
      map: map,
      baseLayerGroup: new OlLayerGroup({
        layers: [layer]
      })
    }, {});
  });

  afterEach(() => {
    wrapper.unmount();
    TestUtils.unmountMapDiv();
  });

  describe('Basics', () => {
    it('is defined', () => {
      expect(LayerSetBaseMapChooser).not.toBe(undefined);
    });

    it('can be rendered', () => {
      expect(wrapper).not.toBe(undefined);
    });
  });

});
