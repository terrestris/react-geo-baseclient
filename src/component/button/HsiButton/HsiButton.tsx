import * as React from 'react';
import { connect } from 'react-redux';

import ToggleButton, { ToggleButtonProps } from '@terrestris/react-geo/dist/Button/ToggleButton/ToggleButton';

import OlMap from 'ol/Map';
import OlSourceImageWMS from 'ol/source/ImageWMS';
import OlSourceTileWMS from 'ol/source/TileWMS';

import {
  abortFetchingFeatures,
  fetchFeatures,
  clearFeatures
} from '../../../state/actions/RemoteFeatureAction';

interface DefaultHsiButtonProps extends ToggleButtonProps {
  dataRange: any;
  iconName: string;
  /**
  * Whether the GFI control should requests all layers at a given coordinate
  * or just the uppermost one.
  * @type {Boolean}
  */
  drillDown: boolean;
  /**
   * Boolean to indicate that we do not want to hover but use click to retrieve
   * feature information
   */
  getInfoByClick: boolean;
}
interface HsiButtonStateProps {
  pressed: boolean;
}

interface HsiButtonProps extends Partial<DefaultHsiButtonProps> {
  /**
   * OlMap this button is bound to.
   * @type {OlMap}
   */
  map: OlMap;

  /**
   * Button tooltip text
   */
  tooltip: string;

  /**
   * Translate function
   */
  t: (arg: string) => void;

  /**
   * Dispatch function
   */
  dispatch: (arg: any) => void;
}

/**
 * mapStateToProps - mapping state to props of HsiButton Component.
 *
 * @param {Object} state current state
 * @return {Object} mapped props
 */
const mapStateToProps = (state: any) => {
  return {
    dataRange: state.dataRange
  };
};

/**
 * Class representing the HsiButton.
 *
 * @class HsiButton
 * @extends React.Component
 */
export class HsiButton extends React.Component<HsiButtonProps, HsiButtonStateProps> {

  /**
 * The default properties.
 */
  public static defaultProps: DefaultHsiButtonProps = {
    dataRange: {},
    drillDown: true,
    type: 'primary',
    shape: 'circle',
    iconName: 'fas fa-info',
    getInfoByClick: false
  };

  constructor(props: HsiButtonProps) {
    super(props);

    this.state = {
      pressed: false
    };

    // binds
    this.onHsiToggle = this.onHsiToggle.bind(this);
    this.getInfo = this.getInfo.bind(this);
  }

  /**
   * Toggle handler of the HsiButton. (Un)registers `click`event on map on (un)toggle.
   *
   * @param {boolean} toggled Toggled state of the button.
   */
  onHsiToggle(toggled: boolean) {
    const {
      map,
      dispatch,
      getInfoByClick
    } = this.props;

    this.setState({
      pressed: toggled
    });
    if (toggled) {
      if (getInfoByClick) {
        map.on('click', this.getInfo);
      } else {
        map.on('pointerrest', this.getInfo);
      }
    } else {
      if (getInfoByClick) {
        map.un('click', this.getInfo);
      } else {
        map.un('pointerrest', this.getInfo);
      }

      // remove possible hover artifacts
      dispatch(clearFeatures('HOVER'));
    }
  }

  /**
   * Calls a GFI request to all hoverable (or the uppermost only, if `drillDown`
   * is set to false property) layer(s).
   *
   * @param {ol.MapEvent} olEvt The `pointerrest` event.
   */
  getInfo(olEvt: any) {
    const {
      dispatch,
      drillDown,
      map,
      dataRange,
      getInfoByClick
    } = this.props;
    const mapView: any = map.getView();
    const viewResolution: object = mapView.getResolution();
    const viewProjection: object = mapView.getProjection();
    let pixel: number[];
    if (getInfoByClick) {
      pixel = olEvt.pixel;
    } else {
      pixel = map.getEventPixel(olEvt.originalEvent);
    }
    let featureInfoUrls: string[] = [];

    // dispatch that any running HOVER process should be canceled
    dispatch(abortFetchingFeatures('HOVER'));

    olEvt.map.forEachLayerAtPixel(pixel, (layer: any) => {
      const layerSource: any = layer.getSource();
      if (!layerSource.getFeatureInfoUrl) {
        return;
      }
      const featureInfoUrl: string =
        layer.get('type') === 'WMSTime'
          ? layerSource
            .getFeatureInfoUrl(
              map.getCoordinateFromPixel(pixel),
              viewResolution,
              viewProjection,
              {
                // TODO add check for json format availability
                INFO_FORMAT: 'application/json',
                FEATURE_COUNT: 999999999
              }
            )
            .replace(
              new RegExp('TIME=.*?&'),
              `TIME=${escape(
                dataRange.startDate.format(layer.get('timeFormat')) +
                '/' +
                dataRange.endDate.format(layer.get('timeFormat'))
              )}&`
            )
          : layerSource.getFeatureInfoUrl(
            map.getCoordinateFromPixel(pixel),
            viewResolution,
            viewProjection,
            {
              // TODO add check for json format availability
              INFO_FORMAT: 'application/json',
              FEATURE_COUNT: 10
            }
          );

      featureInfoUrls.push(featureInfoUrl);
      // stop iteration if drillDown is set to false.
      if (!drillDown) {
        return true;
      }
    }, this, this.layerFilter);

    map.getTargetElement().style.cursor = featureInfoUrls.length > 0 ? 'wait' : '';
    dispatch(fetchFeatures(
      'HOVER', featureInfoUrls,
      {olEvt: olEvt}
    ));
  }

  /**
   * Checks if a given layer is hoverable or not.
   *
   * @param {ol.layer.Base} layerCandidate The layer filter candidate.
   * @return {Boolean} Whether the layer is hoverable or not.
   */
  layerFilter(layerCandidate: any) {
    const source = layerCandidate.getSource();
    const isHoverable = layerCandidate.get('hoverable');
    const isWms = source instanceof OlSourceImageWMS || source instanceof OlSourceTileWMS;
    return isHoverable && isWms;
  }

  /**
   * The render function.
   */
  render() {
    const {
      type,
      shape,
      iconName,
      tooltip,
      tooltipPlacement
    } = this.props;

    return (
      <ToggleButton
        type={type}
        shape={shape}
        iconName={iconName}
        pressedIconName={iconName}
        tooltip={tooltip}
        tooltipPlacement={tooltipPlacement}
        onToggle={this.onHsiToggle}
        pressed={this.state.pressed}
      />
    );
  }
}

export default connect(mapStateToProps)(HsiButton);
