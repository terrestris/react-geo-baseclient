// @ts-nocheck
import * as React from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Switch,
  message
} from 'antd';
const TextArea = Input.TextArea;
const Option = Select.Option;

import { OptionProps } from 'antd/lib/select';

import { isFunction, isEmpty, isEqual } from 'lodash';

import OlMap from 'ol/Map';
import OlLayerBase from 'ol/layer/Base';
import { getUid } from 'ol/util';

import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';
import Titlebar from '@terrestris/react-geo/dist/Panel/Titlebar/Titlebar';

import CsrfUtil from '@terrestris/base-util/dist/CsrfUtil/CsrfUtil';

import { MapFishPrintV2Manager } from '@terrestris/mapfish-print-manager';

import PrintUtil from '../../util/PrintUtil/PrintUtil';

import './PrintPanelV2.css';
import { LayerType } from '../../util/types';

interface DefaultPrintPanelV2Props {
  legendBlackList: string[];
  printLayerBlackList: string[];
}

interface PrintPanelProps extends Partial<DefaultPrintPanelV2Props> {

  /**
   * Instance of OL map this component is bound to.
   *
   * @type {OlMap}
   */
  map: OlMap;

  /**
   * Function that should be called if the print manager couldn't
   * be initialized.
   *
   * @type {Function}
   */
  onPrintManagerInitFailed: (msg: string) => void;

  /**
   * List of (vector) layers which should be excluded from list of
   * available legends in print dialog.
   */
  legendBlackList: string[];

  /**
   * List of (vector) layers which should be excluded while printing
   */
  printLayerBlackList: string[];

  /**
   * configuration object holding relevant print servlet URLs
   */
  config: any;

  /**
   * The translate method.
   * @type {Function}
   */
  t: (arg: string) => string;
}

interface PrintPanelState {
  printTitle: string;
  legendTitle: string;
  printDescription: string;
  layout: string;
  scale: string;
  dpi: string;
  outputFormat: string;
  printLabel: boolean;
  layouts: string[];
  scales: string[];
  dpis: string[];
  outputFormats: string[];
  previewUrl: string;
  loadingDownload: boolean;
  loadingPreview: boolean;
  legendIds: number[];
}

/**
 * The PrintPanelV2 container
 *
 * @class PrintPanelV2
 * @extends React.Component
 */
export class PrintPanelV2 extends React.Component<PrintPanelProps, PrintPanelState> {

  printManager = new MapFishPrintV2Manager({
    url: this.props.config.printAction,
    map: this.props.map,
    headers: CsrfUtil.getHeaderObject(),
    // TODO double check whether casting to Number is better than changing the type
    legendFilter: (layer: OlLayerBase) => this.state.legendIds.includes(Number(getUid(layer))),
    layerFilter: (layer: OlLayerBase) => !this.props.printLayerBlackList.includes(layer.get('name'))
  });

  /**
   * Create a PrintPanelV2.
   * @constructs PrintPanelV2
   */
  constructor(props: PrintPanelProps) {
    super(props);

    const {
      t
    } = props;

    this.state = {
      printTitle: t('PrintPanel.defaultPrintTitle'),
      legendTitle: t('PrintPanel.legendTitleText'),
      printDescription: t('PrintPanel.defaultPrintComment'),
      layout: 'A4 Hochformat',
      scale: '',
      dpi: '',
      outputFormat: '',
      printLabel: false,
      layouts: [],
      scales: [],
      dpis: [],
      outputFormats: [],
      previewUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      loadingDownload: false,
      loadingPreview: false,
      legendIds: []
    };
  }

  /**
   *
   */
  componentWillMount() {
    this.initializeMapProvider();
  }

  /**
   * Initializes mapfish provider (v2) and updates state with values retrieved
   * from info.json print capabilities document from backend.
   */
  initializeMapProvider() {
    const {
      onPrintManagerInitFailed,
      config,
      t
    } = this.props;

    const printManager = this.printManager;

    printManager.init()
      .then(() => {
        printManager.capabilities.printURL = config.printUrlAction;
        printManager.capabilities.createURL = config.printCreateUrlAction;

        printManager.setOutputFormat('pdf');

        printManager.on('change:scale', this.onChangeScale);

        this.setState({
          // layout: printManager.getLayout().name,// removed due to static default layout
          scale: printManager.getScale().name,
          dpi: printManager.getDpi().name,
          outputFormat: printManager.getOutputFormat().name,
          layouts: printManager.getLayouts(),
          scales: printManager.getScales(),
          dpis: printManager.getDpis(),
          outputFormats: printManager.getOutputFormats(),
          // TODO double check whether casting to Number is better than changing the type
          legendIds: this.getFilteredLegendLayers().map((layer) => Number(getUid(layer)))
        });
      })
      .catch((error: any) => {
        message.error(t('PrintPanel.fetchCapabilitiesErrorMsg'));

        if (isFunction(onPrintManagerInitFailed)) {
          onPrintManagerInitFailed(error.message);
        }
      });
  }

  /**
   *
   */
  componentWillUnmount() {
    this.printManager.un('change:scale', this.onChangeScale);
    this.printManager.shutdownManager();
  }

  /**
   * Fired if the scale is changed (e.g. if the user scales the extent feature).
   *
   * @param {Object} scale The scale.
   */
  onChangeScale = (scale: any) => {
    this.setState({
      scale: scale.name
    });
  };

  /**
   * Called if print title textarea value was changed. Updates state value for
   * print title.
   *
   * @param {Event} evt Input event containing new text value to be set as title.
   */
  onPrintTitleChange = (evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    this.setState({
      printTitle: evt.target.value
    }, () => {
      this.printManager.customParams.mapTitle = this.state.printTitle;
    });
  };

  /**
   * Called if print description textarea value was changed. Updates state
   * value for print description.
   *
   * @param {Event} evt Input event containing new text value to be set
   * as description.
   */
  onPrintDescriptionChange = (evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    this.setState({
      printDescription: evt.target.value
    }, () => {
      this.printManager.customParams.comment = this.state.printDescription;
    });
  };

  /**
   * Called if print layout value was changed. Updates state value for layout.
   *
   * @param {String} layout Layout value to set.
   */
  onPrintLayoutChange = (layout: string) => {
    this.setState({ layout }, () => {
      this.printManager.setLayout(layout);
    });
  };

  /**
   * Called if print scale value was changed. Updates state value for scale.
   *
   * @param {String} scale Scale value to set.
   */
  onPrintScaleChange = (scale: string) => {
    this.setState({ scale }, () => {
      this.printManager.setScale(scale);
    });
  };

  /**
   * Called if print dpi value was changed. Updates state value for dpi.
   *
   * @param {String} dpi Dpi resolution value to set.
   */
  onPrintResolutionChange = (dpi: string) => {
    this.setState({ dpi }, () => {
      this.printManager.setDpi(dpi);
    });
  };

  /**
   * Called if print output format value was changed. Updates state value for
   * outputFormat.
   *
   * @param {String} Output format value to set.
   */
  onPrintOutputFormatChange = (outputFormat: string) => {
    this.setState({ outputFormat }, () => {
      this.printManager.setOutputFormat(outputFormat);
    });
  };

  /**
   * Called if print label switch value was changed.
   * Updates state value for label and determines whether the labels should be
   * also printed or not.
   *
   * @param {Boolean} newValue Value to set.
   */
  onPrintLabelSwitchChange = (newValue: boolean) => {
    this.setState({
      printLabel: newValue
    }, () => {
      this.printManager.customParams.printLabelForSelected = newValue;
    });
  };

  /**
   * Click handler for "print" button.
   */
  onPrintBtnClick = () => {
    const {
      config,
      t
    } = this.props;

    this.setState({
      loadingDownload: true
    });

    this.setCustomPrintParams();

    this.printManager.print(true)
      .then((downloadUrl: string) => {
        this.setState({
          loadingDownload: false
        });
        this.printManager.download(`${config.printGetResultAction}?${downloadUrl.split('?')[1]}`);
      })
      .catch(() => {
        this.setState({
          loadingDownload: false
        });
        message.error(t('PrintPanel.printErrorMsg'));
      });
  };

  /**
   * Click handler for "print preview" button.
   */
  onPreviewBtnClick = () => {
    const {
      config,
      t
    } = this.props;

    const {
      outputFormat,
      dpi
    } = this.state;

    this.setState({
      loadingPreview: true
    });

    this.printManager.setOutputFormat('png');
    this.printManager.setDpi('72');
    this.setCustomPrintParams(true);

    this.printManager.print(false)
      .then((downloadUrl: string) => {
        this.setState({
          previewUrl: `${config.printGetResultAction}?${downloadUrl.split('?')[1]}`,
          loadingPreview: false
        });
      })
      .catch(() => {
        this.setState({
          loadingPreview: false
        });
        message.error(t('PrintPanel.printErrorMsg'));
      });

    this.printManager.setOutputFormat(outputFormat);
    this.printManager.setDpi(dpi);
  };

  /**
   * Sets the custom print params.
   *
   * @param {Boolean} preview Whether to set preview params or not.
   */
  setCustomPrintParams = (preview?: boolean) => {
    const {
      t,
      map
    } = this.props;

    const {
      printTitle,
      legendTitle,
      printDescription,
      legendIds
    } = this.state;

    this.printManager.customParams.mapTitle = printTitle ?
      printTitle : preview ? t('PrintPanel.previewPrintTitle') : '';
    this.printManager.customParams.legendTitle = legendTitle;
    this.printManager.customParams.comment = printDescription ?
      printDescription : preview ? t('PrintPanel.previewPrintDescription') : '';
    this.printManager.customParams.showLegendPage = !preview && !isEmpty(legendIds);
    this.printManager.customParams.attributions =
      PrintUtil.getAttributions(map, this.printManager.extentLayer);
  };

  /**
   * Click handler for "print reset" button. Resets all fields of the print form.
   */
  onResetBtnClick = () => {
    this.setState({
      printTitle: '',
      printDescription: '',
      layout: '',
      // scale: '',
      // dpi: '',
      outputFormat: ''
    });
  };

  /**
   * Get a SelectField option for every printable layer.
   *
   * @return {Array} An array of select options for the LegendSelect field.
   */
  getOptionsForLegendSelect(): React.ReactElement<OptionProps>[] {
    return this.getFilteredLegendLayers()
      .map((layer) =>
        <Option
          key={getUid(layer)}
          value={getUid(layer)}
        >
          {layer.get('name')}
        </Option>
      );
  }

  /**
   * Returns array of layers for which a legend can be printed. This array
   * contains all map layers excepting layers determined in `legendBlackList`
   * prop.
   *
   * @return {Array} Array of layers available for print legend.
   */
  getFilteredLegendLayers(): LayerType[] {
    const {
      map,
      legendBlackList
    } = this.props;

    const layers = PrintUtil.getPrintableLayers(
      map, this.printManager.extentLayer
    );

    return layers.filter((l) => legendBlackList.indexOf(l.get('name')) === -1);
  }

  /**
   * OnChange handler for the printLegends selectfield.
   *
   * @param {Array} value
   */
  onPrintLegendsChange(value: number[]) {
    this.setState({
      legendIds: value
    });
  }

  /**
   * Renders select options for the related combo box (layout, scale, or
   * output format) of the print form depending on retrieved  print capabilities
   * response from the backend.
   *
   * @param {Object} option Object containing option properties to be rendered.
   * @return {React.ReactElement} Option element.
   *
   */
  renderSelectOptions = (option: any): React.ReactElement<OptionProps> => {
    let displayName = option.name;
    // replace commas as thousand separator in values like `1:1,000` coming from
    // backend with dots (`1:1.000`)
    if (option.name.includes(',')) {
      displayName = option.name.replace(new RegExp(',', 'g'), '.');
    }
    return (
      <Option
        key={option.name}
        value={option.name}
      >
        {displayName}
      </Option>
    );
  };

  /**
   * Renders select options for the layout combo box. Filters unneeded template
   * for `Arbeitsausdruck`.
   *
   * @param {Object} option Object containing option properties to be rendered.
   * @return {React.ReactElement} Option element .
   *
   */
  renderLayoutSelectOptions = (option: any): React.ReactElement<OptionProps> => {
    const { t } = this.props;

    const isFiltered = isEqual(option.name, t('PrintPanel.workPrintTemplateTitle'));
    return (
      !isFiltered ?
        <Option
          key={option.name}
          value={option.name}
        >
          {option.name}
        </Option>
        : null
    );
  };

  /**
   * Renders select options for the dpi combo box of the print form.
   *
   * @param {Object} option Object containing option properties to be rendered.
   * @return {React.ReactElement} Option element.
   *
   */
  renderDpiSelectOptions = (option: any): React.ReactElement<OptionProps> => {
    const {
      name,
      value
    } = option;
    const { t } = this.props;
    const mappingObject = {
      72: t('PrintPanel.standardResolutionText'),
      150: t('PrintPanel.highResolutionText')
    };

    return (
      <Option
        key={name}
        value={name}
      >
        {mappingObject[value] ? mappingObject[value] : value}
      </Option>
    );
  };

  /**
   * The render function.
   */
  render() {
    const {
      t
    } = this.props;

    const {
      printTitle,
      printDescription,
      layout,
      scale,
      dpi,
      outputFormat,
      layouts,
      scales,
      dpis,
      outputFormats,
      previewUrl,
      loadingDownload,
      loadingPreview,
      legendIds
    } = this.state;

    return (
      <div className="full-print-panel">
        <Row
          gutter={8}
        >
          {/* preview column*/}
          <Col span={12}>
            <Card
              title={t('PrintPanel.previewCardTitle')}
              loading={loadingPreview}
              className="preview-card"
            >
              <img
                alt="preview"
                src={previewUrl}
              />
            </Card>
          </Col>
          {/* settings column*/}
          <Col
            span={12}
          >
            {/* title and description*/}
            <div className="wrapper-settings-col">
              <Card className="common-settings-card">
                <span className="label-span">{t('PrintPanel.printTitleLabelText')}:</span>
                <TextArea
                  className="common-settings-textarea"
                  placeholder={t('PrintPanel.printTitlePlaceholder')}
                  value={printTitle}
                  maxLength={150}
                  rows={2}
                  onChange={this.onPrintTitleChange}
                />
                <span className="label-span">{t('PrintPanel.printDescriptionLabelText')}:</span>
                <TextArea
                  className="common-settings-textarea"
                  placeholder={t('PrintPanel.printDescriptionPlaceholder')}
                  value={printDescription}
                  maxLength={150}
                  rows={2}
                  onChange={this.onPrintDescriptionChange}
                />
              </Card>
              {/* print properties*/}
              <Card
                className="print-settings-card"
              >
                <div className="select-div">
                  <span className="label-span">{t('PrintPanel.printLayoutLabelText')}:</span>
                  <Select
                    style={{ width: 250 }}
                    placeholder="Select a layout"
                    value={layout}
                    onChange={this.onPrintLayoutChange}
                  >
                    {layouts.map(l => this.renderLayoutSelectOptions(l))}
                  </Select>
                </div>
                <div className="select-div">
                  <span className="label-span">{t('PrintPanel.printScaleLabelText')}:</span>
                  <Select
                    style={{ width: 250 }}
                    placeholder="Select a scale"
                    value={scale}
                    onChange={this.onPrintScaleChange}
                  >
                    {scales.map(s => this.renderSelectOptions(s))}
                  </Select>
                </div>
                <div className="select-div">
                  <span className="label-span">{t('PrintPanel.printResolutionLabelText')}:</span>
                  <Select
                    style={{ width: 250 }}
                    placeholder="Select a resolution"
                    value={dpi}
                    onChange={this.onPrintResolutionChange}
                  >
                    {dpis.map(d => this.renderDpiSelectOptions(d))}
                  </Select>
                </div>
                <div className="select-div">
                  <span className="label-span">{t('PrintPanel.printFormatLabelText')}:</span>
                  <Select
                    style={{ width: 250 }}
                    placeholder="Select a format"
                    value={outputFormat}
                    onChange={this.onPrintOutputFormatChange}
                  >
                    {outputFormats.map(of => this.renderSelectOptions(of))}
                  </Select>
                </div>
                <span
                  style={{ display: 'none' }}
                  className="switch-label-span">
                  {t('PrintPanel.printLabelLabelText')}
                </span>
                <Switch
                  // style={{display: 'none'}}
                  onChange={this.onPrintLabelSwitchChange}
                />
                <Select
                  className="legend-select"
                  maxTagCount={3}
                  mode="multiple"
                  value={legendIds}
                  disabled={isEmpty(legendIds)}
                  onChange={this.onPrintLegendsChange}
                >
                  {this.getOptionsForLegendSelect()}
                </Select>
              </Card>
            </div>
          </Col>
        </Row>
        <Titlebar tools={[
          <SimpleButton
            size="small"
            key="preview-button"
            type="primary"
            loading={loadingPreview}
            onClick={this.onPreviewBtnClick}
          >
            {t('PrintPanel.previewCardTitle')}
          </SimpleButton>,
          <SimpleButton
            size="small"
            key="reset-button"
            type="primary"
            onClick={this.onResetBtnClick}
          >
            {t('PrintPanel.resetBtnText')}
          </SimpleButton>,
          <SimpleButton
            size="small"
            key="print-button"
            type="primary"
            loading={loadingDownload}
            onClick={this.onPrintBtnClick}
          >
            {t('PrintPanel.printBtnText')}
          </SimpleButton>
        ]} />
      </div>
    );
  }
}

export default PrintPanelV2;
