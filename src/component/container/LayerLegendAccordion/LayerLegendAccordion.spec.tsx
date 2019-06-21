/*eslint-env jest*/
import TestUtils from '../../../../config/jest/spec/TestUtils';

import LayerLegendAccordion from './LayerLegendAccordion';

describe('<LayerLegendAccordion />', () => {
  let map;
  let wrapper: any;

  beforeEach(() => {
    map = TestUtils.createMap({});
    wrapper = TestUtils.mountComponent(LayerLegendAccordion, {
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
      expect(LayerLegendAccordion).not.toBe(undefined);
    });

    it('can be rendered', () => {
      expect(wrapper).not.toBe(undefined);
    });
  });

});
