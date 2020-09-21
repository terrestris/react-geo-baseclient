/* eslint-env jest*/
import TestUtils from '../../../../config/jest/spec/TestUtils';

import LayerTreeDropdownContextMenu from './LayerTreeDropdownContextMenu';

describe('<LayerTreeDropdownContextMenu />', () => {
  let layer;
  let map;
  let wrapper: any;

  beforeEach(() => {
    layer = TestUtils.createTileLayer({});
    map = TestUtils.createMap({});
    wrapper = TestUtils.mountComponent(LayerTreeDropdownContextMenu, {
      t: () => {},
      layer,
      map
    }, {});
  });

  afterEach(() => {
    wrapper.unmount();
    TestUtils.unmountMapDiv();
  });

  describe('Basics', () => {
    it('is defined', () => {
      expect(LayerTreeDropdownContextMenu).not.toBe(undefined);
    });

    it('can be rendered', () => {
      expect(wrapper).not.toBe(undefined);
    });
  });

});
