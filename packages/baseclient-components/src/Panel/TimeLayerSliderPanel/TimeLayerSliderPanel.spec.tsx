/*eslint-env jest*/
import TestUtils from '../../../spec/TestUtils';

import TimeLayerSliderPanel from './TimeLayerSliderPanel';

describe('<TimeLayerSliderPanel />', () => {
  let map;
  let wrapper: any;

  beforeEach(() => {
    map = TestUtils.createMap({});
    wrapper = TestUtils.mountComponent(TimeLayerSliderPanel, {
      t: () => {},
      map: map,
    }, {});
  });

  afterEach(() => {
    wrapper.unmount();
    TestUtils.unmountMapDiv();
  });

  describe('Basics', () => {
    it('is defined', () => {
      expect(TimeLayerSliderPanel).not.toBe(undefined);
    });

    it('can be rendered', () => {
      expect(wrapper).not.toBe(undefined);
    });
  });

});
