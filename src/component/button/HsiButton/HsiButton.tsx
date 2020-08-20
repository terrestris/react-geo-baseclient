import * as React from 'react';
import { connect } from 'react-redux';

import ToggleButton, { ToggleButtonProps } from '@terrestris/react-geo/dist/Button/ToggleButton/ToggleButton';

import OlSourceImageWMS from 'ol/source/ImageWMS';
import OlSourceTileWMS from 'ol/source/TileWMS';

import UrlUtil from '@terrestris/base-util/dist/UrlUtil/UrlUtil';
import {
  abortFetchingFeatures,
  fetchFeatures
} from '../../../state/actions/RemoteFeatureAction';

interface DefaultHsiButtonProps extends ToggleButtonProps {
  icon: string,
  /**
  * Whether the GFI control should requests all layers at a given coordinate
  * or just the uppermost one.
  * @type {Boolean}
  */
  drillDown: boolean
}

interface HsiButtonProps extends Partial<DefaultHsiButtonProps> {
  /**
   * OlMap this button is bound to.
   * @type {OlMap}
   */
  map: any,

  /**
   * Button tooltip text
   */
  tooltip: string,

  /**
   * Translate function
   */
  t: (arg: string) => void,

  /**
   * Dispatch function
   */
  dispatch: (arg: any) => void
}

/**
 * Class representing the HsiButton.
 *
 * @class HsiButton
 * @extends React.Component
 */
export class HsiButton extends React.Component<HsiButtonProps> {

  /**
 * The default properties.
 */
  public static defaultProps: DefaultHsiButtonProps = {
    drillDown: true,
    type: 'primary',
    shape: 'circle',
    icon: 'info'
  };

  constructor(props: HsiButtonProps) {
    super(props);

    // binds
    this.onHsiToggle = this.onHsiToggle.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerRest = this.onPointerRest.bind(this);
  }

  /**
   * Toggle handler of the HsiButton. (Un)registers `pointermove` and
   * `pointerrest` events on map on (un)toggle.
   *
   * @param {boolean} toggled Toggled state of the button.
   */
  onHsiToggle(toggled: boolean) {
    const {
      map,
      dispatch
    } = this.props;
    if (toggled) {
      map.on('pointermove', this.onPointerMove);
      map.on('pointerrest', this.onPointerRest);
    } else {
      map.un('pointermove', this.onPointerMove);
      map.un('pointerrest', this.onPointerRest);

      // remove possible hover artifacts
      map.getTargetElement().style.cursor = '';
      dispatch(abortFetchingFeatures('HOVER'));
    }
  }

  /**
 * Sets the cursor to `pointer` if the pointer enters a non-oqaque pixel of
 * a hoverable layer.
 *
 * @param {ol.MapEvent} olEvt The `pointermove` event.
 */
  onPointerMove(olEvt: any) {
    if (olEvt.dragging) {
      return;
    }

    const map: any = this.props.map;
    const pixel: number[] = map.getEventPixel(olEvt.originalEvent);
    const hit: boolean = map.forEachLayerAtPixel(pixel, () => true, this, this.layerFilter);

    map.getTargetElement().style.cursor = hit ? 'pointer' : '';
  }

  /**
   * Calls a GFI request to all hoverable (or the uppermost only, if `drillDown`
   * is set to false property) layer(s).
   *
   * @param {ol.MapEvent} olEvt The `pointerrest` event.
   */
  onPointerRest(olEvt: any) {

    const {
      dispatch,
      drillDown,
      map
    } = this.props;
    const mapView: any = map.getView();
    const viewResolution: object = mapView.getResolution();
    const viewProjection: object = mapView.getProjection();
    const pixel: number[] = map.getEventPixel(olEvt.originalEvent);
    let featureInfoUrls: string[] = [];

    // dispatch that any running HOVER process should be canceled
    dispatch(abortFetchingFeatures('HOVER'));

    let infoUrlsToCombine: any = {};
    map.forEachLayerAtPixel(pixel, (layer: any) => {
      const layerSource: any = layer.getSource();
      if (!layerSource.getFeatureInfoUrl) {
        return;
      }
      const featureInfoUrl: string = layerSource.getFeatureInfoUrl(
          map.getCoordinateFromPixel(pixel),
          viewResolution,
          viewProjection,
        {
           // TODO add check for json format availability
          'INFO_FORMAT': 'application/json',
          'FEATURE_COUNT': 10
        }
        );

      if (featureInfoUrl.indexOf('geoserver.action') >= 0) {
        const ftName: string = layer.getSource().getParams().LAYERS;
        const namespace: string = ftName.indexOf(':') > -1 ? ftName.split(':')[0] : ftName;
        if (!infoUrlsToCombine[namespace]) {
          infoUrlsToCombine[namespace] = [];
        }
        infoUrlsToCombine[namespace].push(featureInfoUrl);
      } else {
        featureInfoUrls.push(featureInfoUrl);
      }
        // stop iteration if drillDown is set to false.
      if (!drillDown) {
        return true;
      }
    }, this, this.layerFilter);

      // bundle requests depending on namespace before since interceptor currently
      // can not handle GFI requests containing layers with different namespaces
    if (Object.keys(infoUrlsToCombine).length > 0) {
      Object.keys(infoUrlsToCombine).forEach(key => {
        const url: any = UrlUtil.bundleOgcRequests(infoUrlsToCombine[key], true);
        featureInfoUrls = featureInfoUrls.concat(url);
      });
    }

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
    let source = layerCandidate.getSource();
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
        icon,
        tooltip,
        tooltipPlacement
      } = this.props;
    return (
        <ToggleButton
          type={type}
          shape={shape}
          icon={icon}
          tooltip={tooltip}
          tooltipPlacement={tooltipPlacement}
          onToggle={this.onHsiToggle}
        />
    );
  }
}

export default connect(null)(HsiButton);
