import * as React from 'react';

import OlMap from 'ol/Map';
import OlSourceVector from 'ol/source/Vector';
import OlLayerVector from 'ol/layer/Vector';
import OlStyleStyle from 'ol/style/Style';
import OlStyleFill from 'ol/style/Fill';
import OlStyleStroke from 'ol/style/Stroke';
import OlStyleCircle from 'ol/style/Circle';

import {
  Menu
} from 'antd';
const MenuItem = Menu.Item;

import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';
import Window from '@terrestris/react-geo/dist/Window/Window';

const isEqual = require('lodash/isEqual');
const isEmpty = require('lodash/isEmpty');

import { MapUtil } from '@terrestris/ol-util/dist/MapUtil/MapUtil';
import FeatureInfoGrid from '../../FeatureInfoGrid/FeatureInfoGrid';
import { clearFeatures } from '../../../state/actions/RemoteFeatureAction';
import './FeatureInfo.less';

interface DefaultFeatureInfoProps {
  /**
   * The maximum number of menu items to display.
   * @type {Number}
   */
  maxMenuItems: number;
}

interface FeatureInfoProps extends Partial<DefaultFeatureInfoProps> {
  /**
  * The features to render in the menu.
  * @type {Array}
   */
  features: any;

  /**
   * The ol map.
   * @type {ol.Map}
   */
  map: any; // OlMap

  /**
   * Translate function
   */
  t: (arg: string) => void;

  /**
   * Dispatch function
   */
  dispatch: (arg: any) => void;
}

interface FeatureInfoState {
  menuHidden: boolean;
  gridWinHidden: boolean;
  featuresToShow: any[]; // OlFeature[]
  selectedFeatureType: string;
  downloadGridData: boolean;
}

/**
 * The FeatureInfo Menu component.
 *
 * @class FeatureInfo.
 * @extends React.Component
 */
export class FeatureInfo extends React.Component<FeatureInfoProps, FeatureInfoState> {

  /**
   * The default properties.
   */
  public static defaultProps: DefaultFeatureInfoProps = {
    maxMenuItems: 10
  };

  /**
   * Vector layer to represent hovered features.
   */
  private hoverVectorLayer: any = null;

  /**
   * The constructor.
   *
   * @param {Object} props The initial props.
   */
  constructor(props: FeatureInfoProps) {
    super(props);

    this.state = {
      menuHidden: false,
      gridWinHidden: true,
      featuresToShow: [],
      selectedFeatureType: null,
      downloadGridData: false
    };

    // binds
    this.onMenuItemClick = this.onMenuItemClick.bind(this);
    this.onMenuMouseEnter = this.onMenuMouseEnter.bind(this);
    this.onSubMenuMouseLeave = this.onSubMenuMouseLeave.bind(this);
    this.hideFeatureInfoWindow = this.hideFeatureInfoWindow.bind(this);
    this.handleDownloadButton = this.handleDownloadButton.bind(this);

  }

  /**
   * Style function for hover vector layer.
   * @param feat
   */
  hoverStyleFunction(feat: any) {
    let fillColor: string = 'rgba(255, 205, 0, 0.5)';
    let strokeColor: string = 'rgba(255, 205, 0, 1)';
    if (feat.get('selectedFeat')) {
      fillColor = 'rgba(150, 0, 0, 0.5)';
      strokeColor = 'rgba(150, 0, 0, 1)';
    }
    return new OlStyleStyle({
      fill: new OlStyleFill({
        color: fillColor
      }),
      stroke: new OlStyleStroke({
        color: strokeColor,
        width: 7
      }),
      image: new OlStyleCircle({
        radius: 10,
        fill: new OlStyleFill({
          color: fillColor
        }),
        stroke: new OlStyleStroke({
          color: strokeColor,
          width: 3
        })
      })
    });
  }

  /**
   * componentDidMount lifecycle function. Calls `initHoverVectorLayer` method.
   */
  componentDidMount() {
    if (this.props.map) {
      this.initHoverVectorLayer(this.props.map);
    }
  }

  /**
   * componentDidUpdate lifecycle function.
   *
   * @param {FeatureInfoProps} prevProps Previous props
   */
  componentDidUpdate(prevProps: FeatureInfoProps) {
    const {
      features,
      map,
      maxMenuItems
    } = this.props;

    // The map prop will arrive async, therefore we can't be sure to init the
    // hover layer in componentDidMount.
    if (!prevProps.map && map instanceof OlMap) {
      this.initHoverVectorLayer(map);
    }

    if (!isEqual(features, prevProps.features)) {
      const hoverFeatures: any[] = [];
      const featureTypes: string[] = Object.keys(features);
      featureTypes.slice(0, maxMenuItems).forEach((featTypeName: string) => {
        features[featTypeName].forEach((feat: any) => {
          hoverFeatures.push(feat);
        });
      });
      const hoverVectorSource = this.hoverVectorLayer.getSource();
      this.clearHoverLayerSource();
      hoverVectorSource.addFeatures(hoverFeatures);
    }

    if (!isEmpty(features) && this.state.menuHidden) {
      this.setState({
        menuHidden: false
      });
    }
  }

  /**
 * Initializes the vector layer that will be used to handle the hover
 * features on the map.
 *
 * @param {OlMap} map The map to init the layer in.
 */
  initHoverVectorLayer(map: any) {
    let hoverVectorLayer = MapUtil.getLayersByProperty(
      map, 'name', 'hoverVectorLayer'
    )[0];

    if (!hoverVectorLayer) {
      hoverVectorLayer = new OlLayerVector({
        source: new OlSourceVector(),
        style: this.hoverStyleFunction
      });
      hoverVectorLayer.set('name', 'hoverVectorLayer');

      map.addLayer(hoverVectorLayer);
    }
    this.hoverVectorLayer = hoverVectorLayer;
  }

  /**
   * Clears the source of the hover vector layer.
   *
   * @param {Boolean} clearSelection Whether the features currently shown in
   *   feature info grid also should be cleared from source or not. Default is
   *   false.
   */
  clearHoverLayerSource(clearSelection: boolean = false) {
    const source = this.hoverVectorLayer.getSource();
    let hoverFeatures = source.getFeatures();
    if (!clearSelection) {
      hoverFeatures = hoverFeatures.filter((f: any) => f.get('selectedFeat') !== true);
    }
    hoverFeatures.forEach((hf: any) => {
      source.removeFeature(hf);
    });
  }

  /**
   * Resets the style of the hover vector features to the inital style.
   */
  resetHoverLayerStyle() {
    const hoverFeatures = this.hoverVectorLayer.getSource().getFeatures();
    hoverFeatures.forEach((feat: any) => feat.setStyle(null));
  }

  /**
 * Called if the an item of the hover menu has been clicked.
 *
 * @param {React.MouseEvent} evt The click event.
 */
  onMenuItemClick(evt: any) {
    const selectedFeatureType = evt.key;
    const featuresToShow = this.props.features[selectedFeatureType];

    this.setState({
      menuHidden: true,
      featuresToShow: featuresToShow,
      gridWinHidden: false,
      selectedFeatureType: selectedFeatureType
    });
  }

  /**
   * Renders a menu item for each feature type retrieved by GetFeatureInfo
   * request.
   *
   * @param {String} featType Original (qualified) feature type name.
   */
  getMenuItemForFeatureType(featType: string) {
    const layer = MapUtil.getLayerByNameParam(this.props.map, featType);
    const count = this.props.features[featType].length;

    return (
      <MenuItem
        key={featType}
        onMouseEnter={this.onMenuMouseEnter}
        onMouseLeave={this.onSubMenuMouseLeave}
      >
        {`${layer && layer.get('name') || featType} (${count})`}
      </MenuItem>
    );
  }

  /**
   * Called if the mouse enters a menu item.
   *
   * @param {React.MouseEvent} evt The mouseenter event.
   */
  onMenuMouseEnter(evt: any) {
    const features = this.props.features[evt.key];
    const highlightSource = this.hoverVectorLayer.getSource();
    highlightSource.addFeatures(features);
    this.resetHoverLayerStyle();
    this.setHoverLayerStyle(features);
  }

  /**
   * Called if the mouse leaves a menu item.
   */
  onSubMenuMouseLeave() {
    this.resetHoverLayerStyle();
    this.clearHoverLayerSource();
  }

  /**
   * Sets the hover style to the given features.
   *
   * @param {OlFeature} features The features to set the style to.
   */
  setHoverLayerStyle(features: any[]) {
    features.forEach(feat => feat.setStyle(this.hoverStyleFunction));
  }

  /**
  * Sets selectedFeatureType to null and hides feature info window.
   */
  hideFeatureInfoWindow() {
    this.setState({
      selectedFeatureType: null,
      gridWinHidden: true,
      featuresToShow: []
    });
    this.clearHoverLayerSource(true);
    this.props.dispatch(clearFeatures('HOVER'));
  }

  handleDownloadButton() {
    const {
      downloadGridData
    } = this.state;

    this.setState({
      downloadGridData: !downloadGridData
    });
  }

  /**
   * The render method.
   *
   * @return {Component} The component.
   */
  render() {
    const {
      features,
      map,
      maxMenuItems,
      t,
      dispatch,
      ...passThroughProps
    } = this.props;

    const {
      menuHidden,
      gridWinHidden,
      selectedFeatureType,
      featuresToShow,
      downloadGridData
    } = this.state;

    const tools = [];

    let winTitle;
    let layerToShow;
    if (selectedFeatureType) {
      layerToShow = MapUtil.getLayerByNameParam(map, selectedFeatureType);
      winTitle = layerToShow.get('name') || selectedFeatureType;
    }

    if (layerToShow && layerToShow.get('type') === 'WMSTime') {
      tools.push(
        <SimpleButton
          iconName="fas fa-save"
          key="download-tool"
          size="small"
          tooltip={t('General.downloadData') as unknown as string}
          onClick={this.handleDownloadButton}
        />
      );
    }

    tools.push(
      <SimpleButton
        iconName="fas fa-times"
        key="close-tool"
        size="small"
        tooltip={t('General.close') as unknown as string}
        onClick={this.hideFeatureInfoWindow}
      />
    );

    return (
      <div>
        {
          !gridWinHidden && selectedFeatureType &&
            <Window
              onEscape={this.hideFeatureInfoWindow}
              title={winTitle}
              minWidth={300}
              maxWidth={500}
              height={250}
              maxHeight={500}
              x={50}
              y={50}
              collapseTooltip={t('General.collapse') as unknown as string}
              bounds="#app"
              tools={tools}
            >
              <FeatureInfoGrid
                isTimeLayer={layerToShow && layerToShow.get('type') === 'WMSTime'}
                features={featuresToShow}
                hoverVectorLayer={this.hoverVectorLayer}
                downloadGridData={downloadGridData}
                t={t}
              />

            </Window>
        }
        {
          !menuHidden && <Menu
            className="feature-info-menu"
            onClick={this.onMenuItemClick}
            {...passThroughProps}
          >
            {
              Object.keys(features).map(featType => this.getMenuItemForFeatureType(featType))
            }
          </Menu>
        }
      </div>
    );
  }
}

export default FeatureInfo;
