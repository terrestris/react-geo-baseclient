/* eslint-env jest*/
import TestUtils from '../../../config/jest/spec/TestUtils';

import PrintPanelV3 from './PrintPanelV3';

describe('<PrintPanelV3 />', () => {
  let map;
  let wrapper: any;

  beforeEach(() => {
    map = TestUtils.createMap({});
    wrapper = TestUtils.mountComponent(PrintPanelV3, {
      t: () => {},
      map: map,
      config: {
        printServletPath: () => 'http://localhost/print/',
        getPrintFormats: () => ['pdf', 'png']
      }
    }, {});
  });

  afterEach(() => {
    wrapper.unmount();
    TestUtils.unmountMapDiv();
  });

  describe('Basics', () => {
    it('is defined', () => {
      expect(PrintPanelV3).not.toBe(undefined);
    });

    it('can be rendered', () => {
      expect(wrapper).not.toBe(undefined);
    });
  });

  describe('Private methods', () => {

    describe('#onChangeScale', () => {

      it('sets state value for scale on call', () => {
        const scale = 1000;

        wrapper.instance().onChangeScale(scale);
        expect(wrapper.state().scale).toBe(scale);
      });
    });

    describe('#onPrintTitleChange', () => {

      it('sets state value for printTitle on call', () => {
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

      it('sets state value for printDescription on call', () => {
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

      it('sets state value for print layout on call', () => {
        const mockLayout = 'mockLayout';

        wrapper.instance().onPrintLayoutChange(mockLayout);
        expect(wrapper.state().layout).toBe(mockLayout);
      });
    });

    describe('#onPrintScaleChange', () => {

      it('sets state value for print scale on call', () => {
        const mockScale = 500;

        wrapper.instance().onPrintScaleChange(mockScale);
        expect(wrapper.state().scale).toBe(mockScale);
      });
    });

    describe('#onPrintResolutionChange', () => {

      it('sets state value for print dpi resolution on call', () => {
        const mockResolution = 72;

        wrapper.instance().onPrintResolutionChange(mockResolution);
        expect(wrapper.state().dpi).toBe(mockResolution);
      });
    });

    describe('#onPrintOutputFormatChange', () => {

      it('sets state value for print output format on call', () => {
        const mockOutputFormat = 'pdf';

        wrapper.instance().onPrintOutputFormatChange(mockOutputFormat);
        expect(wrapper.state().outputFormat).toBe(mockOutputFormat);
      });
    });

    describe('#onPrintLegendCheckboxChange', () => {

      it('sets state value for print legend on call', () => {
        const printLegendEvt = {
          target: {
            checked: true
          }
        };

        expect(wrapper.state().printLegend).toBeFalsy();
        wrapper.instance().onPrintLegendCheckboxChange(printLegendEvt);
        expect(wrapper.state().printLegend).toBeTruthy();

      });
    });

    describe('#onPrintLegendsChange', () => {

      it('sets state value for printable legendIds on call', () => {
        const legendIds = [1, 2, 5];

        wrapper.instance().onPrintLegendsChange(legendIds);
        expect(wrapper.state().legendIds).toEqual(legendIds);

      });
    });

    describe('#onResetBtnClick', () => {

      it('resets print form fields on call', () => {

        wrapper.setState({
          printTitle: 'dummyTitle',
          printDescription: 'dummyDescription',
          layout: 'dummyLayout',
          scale: 150,
          dpi: 200,
          outputFormat: 'dummyOutputFormat',
          legendIds: [2, 5]
        });

        expect(wrapper.state().printTitle.length).not.toBeNull();
        expect(wrapper.state().printDescription.length).not.toBeNull();
        expect(wrapper.state().layout.length).not.toBeNull();
        expect(wrapper.state().scale.length).not.toBeNull();
        expect(wrapper.state().dpi.length).not.toBeNull();
        expect(wrapper.state().outputFormat.length).not.toBeNull();

        wrapper.instance().onResetBtnClick();

        expect(wrapper.state().printTitle).toBeUndefined();
        expect(wrapper.state().printDescription).toBe('');
        expect(wrapper.state().layout).toBeUndefined();
        expect(wrapper.state().scale).toBeUndefined();
        expect(wrapper.state().dpi).toBeUndefined();
        expect(wrapper.state().outputFormat).toBe('pdf');
        expect(wrapper.state().legendIds).toEqual([]);
      });
    });

    describe('#renderFormatSelectOptions', () => {

      it('returns option for format string', () => {
        const format = 'format';
        const got = wrapper.instance().renderFormatSelectOptions(format);
        expect(got.props.children).toBe(format);
      });
    });

    describe('#renderScaleSelectOptions', () => {

      it('returns option for scale value', () => {
        const scale = 100;
        const got = wrapper.instance().renderScaleSelectOptions(scale);
        expect(got.props.children).toBe(`1:${scale}`);
      });
    });

    describe('#renderLayoutSelectOptions', () => {

      it('returns option for layout object', () => {
        const layout = {
          name: 'a4'
        };
        const got = wrapper.instance().renderLayoutSelectOptions(layout);
        expect(got.props.children).toBe(layout.name);
      });
    });

    describe('#renderDpiSelectOptions', () => {

      it('returns option for dpi value', () => {
        const dpi = 150;
        const got = wrapper.instance().renderDpiSelectOptions(dpi);
        expect(got.props.children).toBe(`${dpi} dpi`);
      });
    });
  });
});
