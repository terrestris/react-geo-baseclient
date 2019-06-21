/*eslint-env jest*/
import TestUtils from '../../../../config/jest/spec/TestUtils';

import PrintButton from './PrintButton';

describe('<PrintButton />', () => {
  let map;
  let wrapper: any;

  beforeEach(() => {
    map = TestUtils.createMap({});
    wrapper = TestUtils.shallowComponent(PrintButton, {
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
      expect(PrintButton).not.toBe(undefined);
    });

    it('can be rendered', () => {
      expect(wrapper).not.toBe(undefined);
    });
  });

});
