/*eslint-env jest*/
import TestUtils from '../../../spec/TestUtils';

import LayerSetBaseMapChooser from './LayerSetBaseMapChooser';

describe('<LayerSetBaseMapChooser />', () => {
  let map;
  let wrapper: any;

  beforeEach(() => {
    map = TestUtils.createMap({});
    wrapper = TestUtils.mountComponent(LayerSetBaseMapChooser, {
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
      expect(LayerSetBaseMapChooser).not.toBe(undefined);
    });

    it('can be rendered', () => {
      expect(wrapper).not.toBe(undefined);
    });
  });

});
