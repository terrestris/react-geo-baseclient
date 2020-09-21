/* eslint-env jest*/
import TestUtils from '../../../config/jest/spec/TestUtils';

import LayerLegendAccordionTreeNode from './LayerLegendAccordionTreeNode';

describe('<LayerLegendAccordionTreeNode />', () => {
  let layer;
  let wrapper: any;

  beforeEach(() => {
    layer = TestUtils.createTileLayer({});
    wrapper = TestUtils.mountComponent(LayerLegendAccordionTreeNode, {
      t: () => {},
      layer
    }, {});
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe('Basics', () => {
    it('is defined', () => {
      expect(LayerLegendAccordionTreeNode).not.toBe(undefined);
    });

    it('can be rendered', () => {
      expect(wrapper).not.toBe(undefined);
    });
  });

});
