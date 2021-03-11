/* eslint-env jest*/
import TestUtils from '../../../../config/jest/spec/TestUtils';

import PermalinkButton from './PermalinkButton';

describe('<PermalinkButton />', () => {
  let map;
  let wrapper: any;

  beforeEach(() => {
    map = TestUtils.createMap({});
    wrapper = TestUtils.shallowComponent(PermalinkButton, {
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
      expect(PermalinkButton).not.toBe(undefined);
    });

    it('can be rendered', () => {
      expect(wrapper).not.toBe(undefined);
    });
  });

});
