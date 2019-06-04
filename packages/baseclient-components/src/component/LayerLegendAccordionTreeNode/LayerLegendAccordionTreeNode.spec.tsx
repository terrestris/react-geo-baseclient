/*eslint-env jest*/
import TestUtils from '../../../spec/TestUtils';

import LayerLegendAccordionTreeNode from './LayerLegendAccordionTreeNode';

describe('<LayerLegendAccordionTreeNode />', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = TestUtils.shallowComponent(LayerLegendAccordionTreeNode, {
      t: (t: string) => t
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
