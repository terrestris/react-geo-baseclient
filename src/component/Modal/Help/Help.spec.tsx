/*eslint-env jest*/
import TestUtils from '../../../../config/jest/spec/TestUtils';

import Help from './Help';

describe('<Help />', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = TestUtils.mountComponent(Help, {
      t: () => {},
      onCancel: () => {},
      helpPdf: './help.pdf'
    }, {});
  });

  afterEach(() => {
    wrapper.unmount();
    TestUtils.unmountMapDiv();
  });

  describe('Basics', () => {
    it('is defined', () => {
      expect(Help).not.toBe(undefined);
    });

    it('can be rendered', () => {
      expect(wrapper).not.toBe(undefined);
    });
  });
});
