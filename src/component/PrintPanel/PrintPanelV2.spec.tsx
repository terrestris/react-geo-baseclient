/*eslint-env jest*/
import TestUtils from '../../../config/jest/spec/TestUtils';

import PrintPanelV2 from './PrintPanelV2';

describe('<PrintPanelV2 />', () => {
  let map;
  let wrapper: any;

  beforeEach(() => {
    map = TestUtils.createMap({});
    wrapper = TestUtils.mountComponent(PrintPanelV2, {
      t: () => {},
      map: map,
      config: {
        printAction: 'http://nowhere.com'
      }
    }, {});
  });

  afterEach(() => {
    wrapper.unmount();
    TestUtils.unmountMapDiv();
  });

  describe('Basics', () => {
    it('is defined', () => {
      expect(PrintPanelV2).not.toBe(undefined);
    });

    it('can be rendered', () => {
      expect(wrapper).not.toBe(undefined);
    });
  });

  describe('Private methods', () => {

    describe('#onChangeScale', () => {

      it ('sets state value for scale on call', () => {
        const scale = {
          name: '1:1000'
        };

        wrapper.instance().onChangeScale(scale);
        expect(wrapper.state().scale).toBe(scale.name);
      });
    });

    describe('#onPrintTitleChange', () => {

      it ('sets state value for printTitle on call', () => {
        const mockInputEvt = {
          target: {
            value: 'mockTitle'
          }
        };

        wrapper.instance().onPrintTitleChange(mockInputEvt);
        expect(wrapper.state().printTitle).toBe(mockInputEvt.target.value);
      });
    });

    describe('#onPrintDescriptionChange', () => {

      it ('sets state value for printDescription on call', () => {
        const mockInputEvt = {
          target: {
            value: 'mockDescription'
          }
        };

        wrapper.instance().onPrintDescriptionChange(mockInputEvt);
        expect(wrapper.state().printDescription).toBe(mockInputEvt.target.value);
      });
    });

    describe('#onPrintLayoutChange', () => {

      it ('sets state value for print layout on call', () => {
        const mockLayout = 'mockLayout';

        wrapper.instance().onPrintLayoutChange(mockLayout);
        expect(wrapper.state().layout).toBe(mockLayout);
      });
    });

    describe('#onPrintScaleChange', () => {

      it ('sets state value for print scale on call', () => {
        const mockScale = 'mockScale';

        wrapper.instance().onPrintScaleChange(mockScale);
        expect(wrapper.state().scale).toBe(mockScale);
      });
    });

    describe('#onPrintResolutionChange', () => {

      it ('sets state value for print dpi resolution on call', () => {
        const mockResolution = 'mockResolution';

        wrapper.instance().onPrintResolutionChange(mockResolution);
        expect(wrapper.state().dpi).toBe(mockResolution);
      });
    });

    describe('#onPrintOutputFormatChange', () => {

      it ('sets state value for print output format on call', () => {
        const mockOutputFormat = 'mockOutputFormat';

        wrapper.instance().onPrintOutputFormatChange(mockOutputFormat);
        expect(wrapper.state().outputFormat).toBe(mockOutputFormat);
      });
    });

    describe('#onPrintLabelSwitchChange', () => {

      it ('inverts state value for print label on call', () => {
        const printLabelSwitchState = true;

        expect(wrapper.state().printLabel).toBeFalsy();
        wrapper.instance().onPrintLabelSwitchChange(printLabelSwitchState);
        expect(wrapper.state().printLabel).toBeTruthy();

      });
    });

    describe('#onResetBtnClick', () => {

      it ('resets print form fields on call', () => {

        wrapper.setState({
          printTitle: 'dummyTitle',
          printDescription: 'dummyDescription',
          layout: 'dummyLayout',
          scale: 'dummyScale',
          dpi: 'dummyDpi',
          outputFormat: 'dummyOutputFormat'
        });

        expect(wrapper.state().printTitle.length).not.toBeNull();
        expect(wrapper.state().printDescription.length).not.toBeNull();
        expect(wrapper.state().layout.length).not.toBeNull();
        expect(wrapper.state().scale.length).not.toBeNull();
        expect(wrapper.state().dpi.length).not.toBeNull();
        expect(wrapper.state().outputFormat.length).not.toBeNull();

        wrapper.instance().onResetBtnClick();

        expect(wrapper.state().printTitle).toBe('');
        expect(wrapper.state().printDescription).toBe('');
        expect(wrapper.state().layout).toBe('');
        expect(wrapper.state().scale).toBe('dummyScale');
        expect(wrapper.state().dpi).toBe('dummyDpi');
        expect(wrapper.state().outputFormat).toBe('');
      });
    });
  });
});
