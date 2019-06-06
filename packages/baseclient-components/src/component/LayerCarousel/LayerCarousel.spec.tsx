/*eslint-env jest*/
import TestUtils from '../../../spec/TestUtils';

import LayerCarousel from './LayerCarousel';

describe('<LayerCarousel />', () => {
  let map;
  let wrapper: any;

  beforeEach(() => {
    map = TestUtils.createMap({});
    wrapper = TestUtils.shallowComponent(LayerCarousel, {
      map: map,
      t: (t: string) => t
    }, {});
  });

  afterEach(() => {
    wrapper.unmount();
    TestUtils.unmountMapDiv();
  });

  describe('Basics', () => {
    it('is defined', () => {
      expect(LayerCarousel).not.toBe(undefined);
    });

    it('can be rendered', () => {
      expect(wrapper).not.toBe(undefined);
    });
  });

});
