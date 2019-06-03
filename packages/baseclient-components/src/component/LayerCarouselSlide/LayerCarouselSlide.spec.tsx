/*eslint-env jest*/
import TestUtils from '../../../spec/TestUtils';

import LayerCarouselSlide from './LayerCarouselSlide';

describe('<LayerCarouselSlide />', () => {
  let map;
  let wrapper: any;

  beforeEach(() => {
    map = TestUtils.createMap({});
    wrapper = TestUtils.shallowComponent(LayerCarouselSlide, {
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
      expect(LayerCarouselSlide).not.toBe(undefined);
    });

    it('can be rendered', () => {
      expect(wrapper).not.toBe(undefined);
    });
  });

});
