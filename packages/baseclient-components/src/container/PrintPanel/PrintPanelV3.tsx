import * as React from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Skeleton,
  Checkbox,
  message
} from 'antd';
const TextArea = Input.TextArea;
const Option = Select.Option;
import { isFunction, isEmpty } from 'lodash';
import {
  SimpleButton,
  Titlebar
} from '@terrestris/react-geo';

import MapUtil from '@terrestris/ol-util/dist/MapUtil/MapUtil';

import { MapFishPrintV3Manager } from '@terrestris/mapfish-print-manager';

import PrintUtil from '../../util/PrintUtil/PrintUtil';

import './PrintPanelV3.less';

interface DefaultPrintPanelV3Props {
  legendBlackList: string[],
  printLayerBlackList: string[]
}

interface PrintConfig {
  printServletPath(): string,
  getPrintFormats(): string[]
}

interface PrintPanelV3Props extends Partial<DefaultPrintPanelV3Props> {

  /**
   * Instance of OL map this component is bound to.
   *
   * @type {OlMap}
   */
  map: any,

  /**
   * Function that should be called if the print manager couldn't
   * be initialized.
   *
   * @type {Function}
   */
  onPrintManagerInitFailed: (message: string) => {},

  /**
   * List of (vector) layers which should be excluded from list of
   * available legends in print dialog.
   *
   *
   * @type {String[]}
   */
  legendBlackList: string[],

  /**
   * List of (vector) layers which should be excluded while printing.
   *
   * @type {String[]}
   */
  printLayerBlackList: string[],

  /**
   * Configuration object holding relevant print servlet settings.
   *
   * @type {Object}
   */
  config: PrintConfig,

  /**
   * The translate method.
   * @type {Function}
   */
  t: (arg: string) => string
}

interface PrintPanelV3State {
  printTitle: string,
  printDescription: string,
  layout: string,
  scale: number|undefined,
  dpi: number|undefined,
  outputFormat: string,
  layouts: [],
  scales: number[],
  dpis: number[],
  outputFormats: string[],
  previewUrl: string,
  loadingDownload: boolean,
  loadingPreview: boolean,
  printLegend: boolean,
  legendIds: number[]
}

/**
 * The PrintPanelV3 container component.
 * Depends on MapFishPrintV3Manager
 * (s. https://github.com/terrestris/mapfish-print-manager/blob/master/src/manager/MapFishPrintV3Manager.js)
 * and works with Mapfish Print Servlet version 3.16 and newer.
 *
 * @class PrintPanelV3
 * @extends React.Component
 */
export class PrintPanelV3 extends React.Component<PrintPanelV3Props, PrintPanelV3State> {

  /**
   * Instance of MapFishPrintV3Manager to operate on.
   */
  private printManager: any;

  /**
   * Base64 image used as placeholder if no preview is shown.
   */
  private previewPlaceholder: string = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  /**
   * Create a PrintPanelV3.
   * @constructs PrintPanelV3
   */
  constructor(props: PrintPanelV3Props) {
    super(props);

    const {
      t
    } = props;

    this.state = {
      printTitle: t('PrintPanel.defaultPrintTitle'),
      printDescription: t('PrintPanel.defaultPrintComment'),
      layout: '',
      scale: undefined,
      dpi: undefined,
      outputFormat: '',
      layouts: [],
      scales: [],
      dpis: [],
      outputFormats: [],
      previewUrl: this.previewPlaceholder,
      loadingDownload: false,
      loadingPreview: false,
      printLegend: false,
      legendIds: []
    };
  }

  /**
   * Initializes mapfish print provider on component mount.
   */
  componentWillMount() {
    this.initializeMapProvider();
  }

  /**
   * Initializes mapfish provider (v3) and updates state with values retrieved
   * from capabilities.json document from servlet.
   */
  initializeMapProvider () {
    const {
      onPrintManagerInitFailed,
      map,
      config,
      t
    } = this.props;

    const printManager = new MapFishPrintV3Manager({
      url: config.printServletPath(),
      map: map,
      customPrintScales: this.getPrintScales(),
      timeout: 30000,
      legendFilter: (layer: any) => this.state.legendIds.includes(layer.ol_uid),
      layerFilter: (layer: any) => !this.props.printLayerBlackList.includes(layer.get('name'))
    });

    this.printManager = printManager;

    printManager.init()
      .then(() => {

        const printFormats = config.getPrintFormats();

        printManager.setOutputFormat(printFormats[0]);

        printManager.on('change:scale', this.onChangeScale);

        this.setState({
          layout: printManager.getLayout().name,
          scale: printManager.getScale(),
          dpi: printManager.getDpi(),
          outputFormat: printFormats[0],
          layouts: printManager.getLayouts(),
          scales: printManager.getScales(),
          dpis: printManager.getDpis(),
          outputFormats: printFormats,
          legendIds: this.getFilteredLegendLayers().map((layer:any) => layer.ol_uid)
        });
      })
      .catch((error:any) => {
        message.error(t('PrintPanel.fetchCapabilitiesErrorMsg') + error.message);
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
   * Return print scales depending on map resolutions.
   *
   * @return {Array} Array of computed map scales.
   */
  getPrintScales() {
    const {
      map
    } = this.props;

    const mapView = map.getView();
    const resolutions = mapView.getResolutions();
    const unit = mapView.getProjection().getUnits() || 'm';
    return resolutions
      .map((res: number) =>
        MapUtil.roundScale(MapUtil.getScaleForResolution(res, unit)
      ))
      .reverse();

  }

  /**
   * Fired if the scale is changed (e.g. if the user scales the extent feature).
   *
   * @param {Number} scale The scale.
   */
  onChangeScale = (scale: number) => {
    this.setState({
      scale
    });
  }

  /**
   * Called if print title input field value was changed.
   * Updates state value for print title.
   *
   * @param {Event} evt Input event containing new text value to be set as title.
   */
  onPrintTitleChange = (evt: any) => {
    this.setState({
      printTitle: evt.target.value
    }, () => {
      this.printManager.customParams.title = this.state.printTitle;
    });
  }

  /**
   * Called if print description textarea value was changed.
   * Updates state value for print description.
   *
   * @param {Event} evt Input event containing new text value to be set
   * as description.
   */
  onPrintDescriptionChange = (evt: any) => {
    this.setState({
      printDescription: evt.target.value
    }, () => {
      this.printManager.customParams.comment = this.state.printDescription;
    });
  }

  /**
   * Called if print layout value was changed.
   * Updates state value for layout.
   *
   * @param {String} layout Layout value to set.
   */
  onPrintLayoutChange = (layout: string) => {
    this.setState({layout}, () => {
      this.printManager.setLayout(layout);
    });
  }

  /**
   * Called if print scale value was changed.
   * Updates state value for scale.
   *
   * @param {Number} scale Scale value to set.
   */
  onPrintScaleChange = (scale: number) => {
    this.setState({scale}, () => {
      this.printManager.setScale(scale);
    });
  }

  /**
   * Called if print dpi value was changed.
   * Updates state value for dpi.
   *
   * @param {Number} dpi Dpi resolution value to set.
   */
  onPrintResolutionChange = (dpi: number) => {
    this.setState({dpi}, () => {
      this.printManager.setDpi(dpi);
    });
  }

  /**
   * Called if print output format value was changed.
   * Updates state value for outputFormat.
   *
   * @param {String} Output format value to set.
   */
  onPrintOutputFormatChange = (outputFormat: any) => {
    this.setState({outputFormat}, () => {
      this.printManager.setOutputFormat(outputFormat);
    });
  }

/**
 * Called if print legend checkbox value was changed.
 * Updates state value for printLegend.
 *
 * @param {Event} evt Event containing checkbox state.
 */
  onPrintLegendCheckboxChange = (evt: any) => {
    this.setState({
      printLegend: evt.target.checked
    }, () => {
      this.printManager.printLegend = this.state.printLegend;
    });
  }

  /**
   * OnChange handler for the printLegends selectfield.
   *
   * @param {Array} legendIds Array of currently set legendIds
   */
  onPrintLegendsChange = (legendIds: number[]) => {
    this.setState({ legendIds });
  }

  /**
   * Click handler for print button.
   */
  onPrintBtnClick = () => {
    const {
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
      })
      .catch(() => {
        this.setState({
          loadingDownload: false
        });
        message.error(t('PrintPanel.printErrorMsg'));
      });
  }

  /**
   * Click handler for print preview button.
   */
  onPreviewBtnClick = () => {
    const {
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

    this.printManager.print()
      .then((downloadUrl: string) => {
        this.setState({
          previewUrl: downloadUrl ? downloadUrl : this.previewPlaceholder,
          loadingPreview: false
        });
        if (!downloadUrl) {
          message.error(t('PrintPanel.printErrorMsg'));
        }
      })
      .catch((error: any) => {
        this.setState({
          previewUrl: this.previewPlaceholder,
          loadingPreview: false
        });
        console.log(error.message);
        message.error(t('PrintPanel.printErrorMsg'));
      });

    this.printManager.setOutputFormat(outputFormat);
    this.printManager.setDpi(dpi);
  }

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
      printDescription,
      legendIds,
      printLegend
    } = this.state;

    this.printManager.customParams.title = printTitle ?
      printTitle : preview ? t('PrintPanel.previewPrintTitle') : '';
    this.printManager.customParams.comment = printDescription ?
      printDescription : preview ? t('PrintPanel.previewPrintDescription') : '';
    this.printManager.customParams.printLegend = !preview && printLegend && !isEmpty(legendIds);
    this.printManager.customParams.printScalebar = true;
    this.printManager.customParams.attributions =
      PrintUtil.getAttributions(map, this.printManager.extentLayer);
  }

  /**
   * Click handler for print reset button. Resets all fields of the print form.
   */
  onResetBtnClick = () => {
    this.setState({
      printTitle: '',
      printDescription: '',
      layout: '',
      scale: undefined,
      dpi: undefined,
      outputFormat: '',
      legendIds: []
    });
  }

  /**
   * Get a SelectField option for every printable layer.
   *
   * @return {Array} An array of select options for the LegendSelect field.
   */
  getOptionsForLegendSelect() {
    return this.getFilteredLegendLayers()
      .map((layer: any) =>
        (
          <Option
            key={layer.ol_uid}
            value={layer.ol_uid}
          >
            {layer.get('name')}
          </Option>
        )
      );
  }

  /**
   * Returns array of layers for which a legend can be printed. This array
   * contains all map layers excepting layers determined in `legendBlackList`
   * prop.
   *
   * @return {Array} Array of layers available for print legend.
   */
  getFilteredLegendLayers() {
    const {
      map,
      legendBlackList
    } = this.props;

    const layers = PrintUtil.getPrintableLayers(
      map, this.printManager.extentLayer
    );

    return layers.filter((l: any) => legendBlackList.indexOf(l.get('name')) === -1);
  }

  /**
   * Renders select options for the format combo box of the print form.
   *
   * @param {String} format Format string to be rendered as option.
   * @return {div} Option element div.
   *
   */
  renderFormatSelectOptions = (format: string) => {
    return (
      <Option key={format}>
        {format}
      </Option>
    );
  }

  /**
   * Renders select options for the scale combo box of the print form.
   *
   * @param {Number} scale Scale value to be rendered as option.
   * @return {div} Option element div.
   */
  renderScaleSelectOptions = (scale: number) => {
    const scaleString = `1:${scale.toLocaleString()}`
    return (
      <Option key={scale.toString()} value={scale}>
        {scaleString}
      </Option>
    );
  }

  /**
   * Renders select options for the layout combo box of the print form.
   *
   * @param {Object} layout Object containing layout name to be rendered as option.
   * @return {div} Option element div.
   */
  renderLayoutSelectOptions = (layout: any) => {
    return (
      <Option key={layout.name}>
        {layout.name}
      </Option>
    );
  }

  /**
   * Renders select options for the dpi combo box of the print form.
   *
   * @param {Number} dpi Dpi value to be rendered as option.
   * @return {div} Option element div.
   */
  renderDpiSelectOptions = (dpi: number) => {
    return (
      <Option key={dpi.toString()} value={dpi}>
        {`${dpi} dpi`}
      </Option>
    );
  }

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
      printLegend,
      legendIds
    } = this.state;

    const printDisabled = !outputFormat || !dpi || !scale || !layout;

    return (
      <div className="print-panel">
        <Row
          gutter={5}
          type="flex"
        >
          {/*preview column*/}
          <Col span={12}>
            <Card className="preview-card">
              <span>{t('PrintPanel.previewCardTitle')}</span>
              {
                loadingPreview ? <Skeleton active /> :
                <img
                  alt="preview"
                  src={previewUrl}
                />
              }
            </Card>
          </Col>
          {/*settings column*/}
          <Col
            span={12}
          >
            {/*title and description*/}
            <div className="wrapper-settings-col">
              <Card className="common-settings-card">
                <div className="title-wrapper">
                  <span className="label-span">{t('PrintPanel.printTitleLabelText')}:</span>
                  <Input
                    placeholder={t('PrintPanel.printTitlePlaceholder')}
                    value={printTitle}
                    onChange={this.onPrintTitleChange}
                  />
                </div>
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
              {/*print properties*/}
              <Card
                className="print-settings-card"
              >
                <div className="select-div">
                  <span className="label-span">{t('PrintPanel.printLayoutLabelText')}:</span>
                  <Select
                    style={{ width: 250 }}
                    placeholder={t('PrintPanel.comboPlaceholder')}
                    value={layout}
                    onChange={this.onPrintLayoutChange}
                  >
                    {layouts.map(layout => this.renderLayoutSelectOptions(layout))}
                  </Select>
                </div>
                <div className="select-div">
                  <span className="label-span">{t('PrintPanel.printScaleLabelText')}:</span>
                  <Select
                    style={{ width: 250 }}
                    placeholder={t('PrintPanel.comboPlaceholder')}
                    value={scale}
                    onChange={this.onPrintScaleChange}
                  >
                    {scales.map(scale => this.renderScaleSelectOptions(scale))}
                  </Select>
                </div>
                <div className="select-div">
                  <span className="label-span">{t('PrintPanel.printResolutionLabelText')}:</span>
                  <Select
                    style={{ width: 250 }}
                    placeholder={t('PrintPanel.comboPlaceholder')}
                    value={dpi}
                    onChange={this.onPrintResolutionChange}
                  >
                    {dpis.map(dpi => this.renderDpiSelectOptions(dpi))}
                  </Select>
                </div>
                <div className="select-div">
                  <span className="label-span">{t('PrintPanel.printFormatLabelText')}:</span>
                  <Select
                    style={{ width: 250 }}
                    placeholder={t('PrintPanel.comboPlaceholder')}
                    value={outputFormat}
                    onChange={this.onPrintOutputFormatChange}
                  >
                    {outputFormats.map(outputFormat => this.renderFormatSelectOptions(outputFormat))}
                  </Select>
                </div>
                <Checkbox
                  className="legend-cb"
                  onChange={this.onPrintLegendCheckboxChange}
                >
                {t('PrintPanel.printLegendCbLabel')}
                </Checkbox>
                {
                  printLegend && <div className="select-div">
                    <span className="label-span">{t('PrintPanel.printLegendsLabelText')}</span>
                    <Select
                      style={{ width: 250 }}
                      maxTagCount={3}
                      mode="multiple"
                      value={legendIds}
                      onChange={this.onPrintLegendsChange}
                    >
                      {this.getOptionsForLegendSelect()}
                    </Select>
                  </div>
                }
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
            disabled={printDisabled}
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
            disabled={printDisabled}
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

export default PrintPanelV3;
