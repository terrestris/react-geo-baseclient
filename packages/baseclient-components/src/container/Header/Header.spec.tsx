/*eslint-env jest*/
import TestUtils from '../../../../spec/TestUtils';

import Header from './Header';

describe('<Header />', () => {
  let map;
  let wrapper: any;
  const changeLanguage = jest.fn();

  beforeEach(() => {
    map = TestUtils.createMap({});
    wrapper = TestUtils.mountComponent(Header, {
      i18n: {
        changeLanguage
      },
      map: map
    }, {});
  });

  afterEach(() => {
    wrapper.unmount();
    TestUtils.unmountMapDiv();
  });

  describe('Basics', () => {
    it('is defined', () => {
      expect(Header).not.toBe(undefined);
    });

    it('can be rendered', () => {
      expect(wrapper).not.toBe(undefined);
    });
  });

  describe('Private methods', () => {
    describe('#onLanguageChange', () => {
      it ('sets state value for language on call', () => {
        wrapper.instance().onLanguageChange('de');
        expect(changeLanguage).toHaveBeenCalled();
      });
    });
  });
});
