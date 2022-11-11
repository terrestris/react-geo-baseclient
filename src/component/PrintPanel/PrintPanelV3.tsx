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

import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { OptionProps } from 'antd/lib/select';

import { isFunction, isEmpty } from 'lodash';

import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';
import Titlebar from '@terrestris/react-geo/dist/Panel/Titlebar/Titlebar';

import OlLayerGroup from 'ol/layer/Group';
import OlMap from 'ol/Map';
import { getUid } from 'ol/util';

import MapFishPrintV3Manager from '@terrestris/mapfish-print-manager/dist/manager/MapFishPrintV3Manager';

import PrintUtil from '../../util/PrintUtil/PrintUtil';
import { MapUtil } from '@terrestris/ol-util';

import './PrintPanelV3.css';

import { LayerType } from '../../util/types';

interface DefaultPrintPanelV3Props {
  legendBlackList: string[];
  printLayerBlackList: string[];
}

export interface PrintConfig {
  printServletPath(): string;
  getPrintFormats(): string[];
  customPrintParams?: any;
}

interface PrintPanelV3Props extends Partial<DefaultPrintPanelV3Props> {

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
  onPrintManagerInitFailed?: (msg: string) => void;

  /**
   * List of (vector) layers which should be excluded from list of
   * available legends in print dialog.
   *
   *
   * @type {String[]}
   */
  legendBlackList: string[];

  /**
   * List of (vector) layers which should be excluded while printing.
   *
   * @type {String[]}
   */
  printLayerBlackList: string[];

  /**
   * Available print scales, which should be shown in print dialog. If not set,
   * fallback values from printCapabilities will be used instead.
   */
  printScales: number[];
  /**
   * Configuration object holding relevant print servlet settings.
   *
   * @type {Object}
   */
  config: PrintConfig;

  /**
   * The translate method.
   * @type {Function}
   */
  t: (arg: string) => string;

  /**
   * Print title. Per default set to configured application name.
   * @type {String}
   */
  printTitle: string;
}

interface PrintPanelV3State {
  printTitle: string;
  legendTitle: string;
  printDescription: string;
  layout: string;
  scale: number;
  dpi: string;
  outputFormat: string;
  layouts: any[];
  scales: number[];
  dpis: string[];
  outputFormats: string[];
  previewUrl: string;
  loadingDownload: boolean;
  loadingPreview: boolean;
  printLegend: boolean;
  legendIds: string[];
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
  private printManager: MapFishPrintV3Manager;

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
      printTitle: props.printTitle,
      printDescription: '',
      legendTitle: t('PrintPanel.legendTitleText'),
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
  initializeMapProvider() {
    const {
      onPrintManagerInitFailed,
      map,
      config,
      t,
      printScales,
      printLayerBlackList
    } = this.props;

    const printManager = new MapFishPrintV3Manager({
      url: config.printServletPath(),
      map: map,
      customPrintScales: printScales,
      timeout: 30000,
      layerFilter: (l: LayerType) => {
        const layerName = l.get('name');
        return layerName && !printLayerBlackList.includes(layerName) &&
          l.getVisible() && !(l instanceof OlLayerGroup);
      }
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
          legendIds: this.getFilteredLegendLayers().map(layer => getUid(layer))
        });
      })
      .catch((error: any) => {
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
   * Fired if the scale is changed (e.g. if the user scales the extent feature).
   *
   * @param {Number} scale The scale.
   */
  onChangeScale = (scale: number) => {
    this.setState({
      scale
    });
  };

  /**
   * Called if print title input field value was changed.
   * Updates state value for print title.
   *
   * @param {Event} evt Input event containing new text value to be set as title.
   */
  onPrintTitleChange = (evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    this.setState({
      printTitle: evt.target.value
    }, () => {
      this.printManager.customParams.title = this.state.printTitle;
    });
  };

  /**
   * Called if print description textarea value was changed.
   * Updates state value for print description.
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
   * Called if print layout value was changed.
   * Updates state value for layout.
   *
   * @param {String} layout Layout value to set.
   */
  onPrintLayoutChange = (layout: string) => {
    this.setState({ layout }, () => {
      this.printManager.setLayout(layout);
    });
  };

  /**
   * Called if print scale value was changed.
   * Updates state value for scale.
   *
   * @param {Number} scale Scale value to set.
   */
  onPrintScaleChange = (scale: number) => {
    this.setState({ scale }, () => {
      this.printManager.setScale(scale);
    });
  };

  /**
   * Called if print dpi value was changed.
   * Updates state value for dpi.
   *
   * @param {String} dpi Dpi resolution value to set.
   */
  onPrintResolutionChange = (dpi: string) => {
    this.setState({ dpi }, () => {
      this.printManager.setDpi(dpi);
    });
  };

  /**
   * Called if print output format value was changed.
   * Updates state value for outputFormat.
   *
   * @param {String} Output format value to set.
   */
  onPrintOutputFormatChange = (outputFormat: string) => {
    this.setState({ outputFormat }, () => {
      this.printManager.setOutputFormat(outputFormat);
    });
  };

  /**
   * Called if print legend checkbox value was changed.
   * Updates state value for printLegend.
   *
   * @param {Event} evt Event containing checkbox state.
   */
  onPrintLegendCheckboxChange = (evt: CheckboxChangeEvent) => {
    this.setState({
      printLegend: evt.target.checked
    }, () => {
      this.printManager.customParams.printLegend = this.state.printLegend;
    });
  };

  /**
   * OnChange handler for the printLegends selectfield.
   *
   * @param {String[]} legendIds Array of currently set legendIds
   */
  onPrintLegendsChange = (legendIds: string[]) => {
    this.setState({ legendIds });
  };

  /**
   * Click handler for print button.
   */
  onPrintBtnClick = (preview: boolean = false) => {
    const {
      t
    } = this.props;

    if (preview) {
      this.setState({
        loadingPreview: true
      });
      this.printManager.setOutputFormat('png');
      this.printManager.setDpi('72');
    } else {
      this.setState({
        loadingDownload: true
      });
      this.printManager.setOutputFormat(this.state.outputFormat);
      this.printManager.setDpi(this.state.dpi);
    }

    this.setCustomPrintParams(preview);
    this.setCustomMapParams();

    this.printManager.print(!preview)
      .then((downloadUrl: string) => {
        if (preview) {
          this.setState({
            previewUrl: downloadUrl ? downloadUrl : this.previewPlaceholder
          });
          if (!downloadUrl) {
            message.error(t('PrintPanel.printErrorMsg'));
          }
        }
      })
      .catch(() => {
        message.error(t('PrintPanel.printErrorMsg'));
      })
      .finally(() => {
        if (preview) {
          this.setState({
            loadingPreview: false
          });
        } else {
          this.setState({
            loadingDownload: false
          });
        }
      });
  };

  /**
   * Sets the custom print params.
   *
   * @param {Boolean} preview Whether to set preview params or not.
   */
  setCustomPrintParams = (preview: boolean) => {

    const {
      t,
      map,
      config
    } = this.props;

    const {
      printTitle,
      legendTitle,
      printDescription,
      legendIds,
      printLegend
    } = this.state;

    this.printManager.customParams.title = printTitle ?
      printTitle : preview ? t('PrintPanel.previewPrintTitle') : '';
    this.printManager.customParams.comment = printDescription ?
      printDescription : preview ? t('PrintPanel.previewPrintDescription') : '';
    this.printManager.customParams.printLegend = printLegend && !isEmpty(legendIds);
    this.printManager.customParams.legendTitle = legendTitle;
    this.printManager.customParams.printScalebar = true;
    this.printManager.customParams.attributions =
      PrintUtil.getAttributions(map, this.printManager.extentLayer);

    // append additional custom params if given
    if (config.customPrintParams && Object.keys(config.customPrintParams).length > 0) {
      this.printManager.customParams = {
        ...this.printManager.customParams,
        ...config.customPrintParams
      };
    }

    // update the legends to be shown
    this.printManager.legendFilter = (layer: any) => printLegend && legendIds.includes(layer.ol_uid);

  };

  /**
   * Sets the custom map params for print.
   * Currently determines only axis orientation of map projection, what is useful
   * for lat/lon based geographic coordinates.
   *
   */
  setCustomMapParams() {
    const {
      map
    } = this.props;
    const proj: any = map.getView().getProjection();
    if (proj.getAxisOrientation() === 'neu') {
      this.printManager.customMapParams.longitudeFirst = true;
    }
  }

  /**
   * Click handler for print reset button. Resets all fields of the print form
   * to its defaults.
   */
  onResetBtnClick = () => {
    const {
      printTitle,
      config,
      map
    } = this.props;
    const unit = map.getView().getProjection().getUnits();
    const mapScale = MapUtil.roundScale(
      MapUtil.getScaleForResolution(map.getView().getResolution(), unit)
    );
    // set default scale to current map scale
    const defaultScale = this.printManager.getScales().filter((scale: number) => {
      return scale < mapScale;
    }).reverse()[0];
    this.printManager.setScale(defaultScale);
    this.setState({
      printTitle: printTitle,
      printDescription: '',
      layout: this.printManager.getLayouts()[0]?.name,
      scale: defaultScale,
      dpi: this.printManager.getDpis()[0],
      outputFormat: config.getPrintFormats()[0],
      legendIds: this.getFilteredLegendLayers().map(layer => getUid(layer)),
      previewUrl: this.previewPlaceholder
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
        (
          <Option
            key={getUid(layer)}
            value={getUid(layer)}
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
  getFilteredLegendLayers(): LayerType[] {
    const {
      map,
      legendBlackList
    } = this.props;

    const layers = PrintUtil.getPrintableLayers(
      map, this.printManager.extentLayer
    );

    return layers.filter((l: LayerType) => legendBlackList.indexOf(l.get('name')) === -1)
      .map((l: LayerType) => {
        l.set('customPrintLegendParams', { 'SCALE': this.state.scale });
        return l;
      });

  }

  /**
   * Renders select options for the format combo box of the print form.
   *
   * @param {String} format Format string to be rendered as option.
   * @return {React.ReactElement} Option element.
   *
   */
  renderFormatSelectOptions = (format: string): React.ReactElement<OptionProps> => {
    return (
      <Option
        key={format}
        value={format}
      >
        {format}
      </Option>
    );
  };

  /**
   * Renders select options for the scale combo box of the print form.
   *
   * @param {Number} scale Scale value to be rendered as option.
   * @return {React.ReactElement} Option element.
   */
  renderScaleSelectOptions = (scale: number): React.ReactElement<OptionProps> => {
    const scaleString = `1:${scale.toLocaleString()}`;
    return (
      <Option key={scale.toString()} value={scale}>
        {scaleString}
      </Option>
    );
  };

  /**
   * Renders select options for the layout combo box of the print form.
   *
   * @param {Object} layout Object containing layout name to be rendered as option.
   * @return {React.ReactElement} Option element.
   */
  renderLayoutSelectOptions = (layout: any): React.ReactElement<OptionProps> => {
    return (
      <Option
        key={layout.name}
        value={layout.name}
      >
        {layout.name}
      </Option>
    );
  };

  /**
   * Renders select options for the dpi combo box of the print form.
   *
   * @param {String} dpi Dpi value to be rendered as option.
   * @return {React.ReactElement} Option element.
   */
  renderDpiSelectOptions = (dpi: string): React.ReactElement<OptionProps> => {
    return (
      <Option
        key={dpi.toString()}
        value={dpi}
      >
        {`${dpi} dpi`}
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
      printLegend,
      legendIds
    } = this.state;

    const printDisabled = !outputFormat || !dpi || !scale || !layout;

    return (
      <div className="print-panel">
        <Row
          gutter={5}
          wrap={false}
        >
          {/* preview column */}
          <Col
            span={12}
            className={'preview-card-col'}
          >
            <Card className='preview-card'>
              <span>{t('PrintPanel.previewCardTitle')}</span>
              {
                loadingPreview ? <Skeleton active={true} /> :
                  <div className="preview-img">
                    <img
                      alt="preview"
                      src={previewUrl}
                    />
                  </div>
              }
            </Card>
          </Col>
          {/* settings column */}
          <Col
            span={12}
          >
            {/* title and description */}
            <div className="wrapper-settings-col">
              <Card className="common-settings-card">
                <div className="title-wrapper">
                  <span className="label-span">{t('PrintPanel.printTitleLabelText')}:</span>
                  <Input
                    placeholder={t('PrintPanel.printTitlePlaceholder')}
                    value={printTitle}
                    maxLength={80}
                    onChange={this.onPrintTitleChange}
                  />
                </div>
                <span className="label-span">{t('PrintPanel.printDescriptionLabelText')}:</span>
                <TextArea
                  className="common-settings-textarea"
                  placeholder={t('PrintPanel.printDescriptionPlaceholder')}
                  value={printDescription}
                  showCount={true}
                  maxLength={100}
                  rows={2}
                  onChange={this.onPrintDescriptionChange}
                />
              </Card>
              {/* print properties */}
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
                    {layouts.map(l => this.renderLayoutSelectOptions(l))}
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
                    {scales.map(s => this.renderScaleSelectOptions(s))}
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
                    {dpis.map(d => this.renderDpiSelectOptions(d))}
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
                    {outputFormats.map(of => this.renderFormatSelectOptions(of))}
                  </Select>
                </div>
                <Checkbox
                  className="legend-cb"
                  onChange={this.onPrintLegendCheckboxChange}
                >
                  {t('PrintPanel.printLegendCbLabel')}
                </Checkbox>
                {
                  printLegend &&
                  <Select
                    className="legend-select"
                    maxTagCount={3}
                    mode="multiple"
                    value={legendIds}
                    onChange={this.onPrintLegendsChange}
                  >
                    {this.getOptionsForLegendSelect()}
                  </Select>
                }
              </Card>
            </div>
          </Col>
        </Row>
        <Titlebar tools={[
          <SimpleButton
            size="small"
            key="preview-button"
            className="preview-button"
            type="primary"
            loading={loadingPreview}
            disabled={printDisabled}
            onClick={() => this.onPrintBtnClick(true)}
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
            onClick={() => this.onPrintBtnClick()}
          >
            {t('PrintPanel.printBtnText')}
          </SimpleButton>
        ]} />
      </div>
    );
  }
}

export default PrintPanelV3;
