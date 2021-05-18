import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import ToggleButton, { ToggleButtonProps } from '@terrestris/react-geo/dist/Button/ToggleButton/ToggleButton';

import OlMap from 'ol/Map';
import OlView from 'ol/View';
import OlProjection from 'ol/proj/Projection';
import OlSourceImageWMS from 'ol/source/ImageWMS';
import OlSourceTileWMS from 'ol/source/TileWMS';
import OlSourceVector from 'ol/source/Vector';
import OlFeature from 'ol/Feature';
import OlLayer from 'ol/layer/Layer';
import OlMapBrowserEvent from 'ol/MapBrowserEvent';

import {
  abortFetchingFeatures,
  fetchFeatures,
  clearFeatures
} from '../../../state/actions/RemoteFeatureAction';

import { BaseClientState } from '../../../state/reducers/Reducer';

interface DefaultHsiButtonProps extends ToggleButtonProps {
  dataRange?: any;
  /**
  * Whether the GFI control should requests all layers at a given coordinate
  * or just the uppermost one.
  * @type {Boolean}
  */
  drillDown?: boolean;
  /**
   * Boolean to indicate that we do not want to hover but use click to retrieve
   * feature information
   */
  getInfoByClick?: boolean;
  /**
   * Additional callback function which will be called when HSI button was toggled.
   * Optional.
   */
  onToggleCb?: () => void;
}

interface HsiButtonProps {
  /**
   * OlMap this button is bound to.
   * @type {OlMap}
   */
  map: OlMap;
  /**
   * Button tooltip text
   */
  tooltip: string;
}

export type ComponentProps = DefaultHsiButtonProps & HsiButtonProps;

/**
 * Class representing the HsiButton.
 *
 * @class HsiButton
 */
export const HsiButton: React.FC<ComponentProps> = ({
  map,
  drillDown = true,
  type = 'primary',
  shape = 'circle',
  iconName = 'fas fa-info',
  tooltip = 'Feature Info',
  tooltipPlacement = 'right',
  getInfoByClick = false,
  onToggleCb = undefined,
  ...passThroughProps
}): React.ReactElement => {

  const dispatch = useDispatch();
  const dataRange = useSelector((state: BaseClientState) => state.dataRange);

  useEffect(() => {
    if (passThroughProps.pressed) {
      if (getInfoByClick) {
        map.on('click', getInfo);
      } else {
        map.on('pointerrest', getInfo);
      }
      // remove possible hover artifacts
      dispatch(clearFeatures('HOVER'));
    }
    return () => {
      if (getInfoByClick) {
        map.un('click', getInfo);
      } else {
        map.un('pointerrest', getInfo);
      }
      // remove possible hover artifacts
      dispatch(clearFeatures('HOVER'));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passThroughProps.pressed]);

  /**
   * Calls a GFI request to all hoverable (or the uppermost only, if `drillDown`
   * is set to false property) layer(s).
   *
   * @param {ol.MapEvent} olEvt The `pointerrest` event.
   */
  const getInfo = (olEvt: OlMapBrowserEvent) => {
    const mapView: OlView = map.getView();
    const viewResolution: number = mapView.getResolution();
    const viewProjection: OlProjection = mapView.getProjection();
    let pixel: number[];
    if (getInfoByClick) {
      pixel = olEvt.pixel;
    } else {
      pixel = map.getEventPixel(olEvt.originalEvent);
    }
    let internalVectorFeatures: { [name: string]: OlFeature[] } = {};
    const featureInfoUrls: string[] = [];

    // dispatch that any running HOVER process should be canceled
    dispatch(abortFetchingFeatures('HOVER'));

    map.forEachLayerAtPixel(pixel, (layer: OlLayer) => {
      const layerSource: any = layer.getSource();
      const coordinate: number[] = map.getCoordinateFromPixel(pixel);

      if (layer.getSource() instanceof OlSourceVector) {
        internalVectorFeatures[layer.get('name')] = [];
        const internalFeatures = olEvt.map.getFeaturesAtPixel(pixel, {
          layerFilter: (layerCandidate: OlLayer) => {
            return layerCandidate === layer;
          }
        });

        if (!internalFeatures.length) {
          return;
        }
        internalVectorFeatures[layer.get('name')] =
          internalFeatures.map((feat: OlFeature) => feat.clone());
        featureInfoUrls.push(`internal://${layer.get('name')}`);
        return;
      }

      if (!layerSource.getFeatureInfoUrl) {
        return;
      }

      let featureInfoUrl: string;
      if (layer.get('type') === 'WMSTime') {
        featureInfoUrl = layerSource.getFeatureInfoUrl(
          coordinate,
          viewResolution,
          viewProjection,
          {
            // TODO add check for json format availability
            INFO_FORMAT: 'application/json',
            FEATURE_COUNT: 999999999
          }
        ).replace(
          new RegExp('TIME=.*?&'),
          `TIME=${escape(
            dataRange.startDate.format(layer.get('timeFormat')) +
            '/' +
            dataRange.endDate.format(layer.get('timeFormat'))
          )}&`
        );
      } else {
        featureInfoUrl = layerSource.getFeatureInfoUrl(
          map.getCoordinateFromPixel(pixel),
          viewResolution,
          viewProjection,
          {
            // TODO add check for json format availability
            INFO_FORMAT: 'application/json',
            FEATURE_COUNT: 10
          }
        );
      }

      featureInfoUrls.push(featureInfoUrl);
      // stop iteration if drillDown is set to false.
      if (!drillDown) {
        return true;
      }
    }, { layerFilter });

    map.getTargetElement().style.cursor = featureInfoUrls.length > 0 ? 'wait' : '';
    dispatch(fetchFeatures(
      'HOVER', featureInfoUrls,
      { olEvt, internalVectorFeatures }
    ));
  };

  /**
 * Checks if a given layer is hoverable or not.
 *
 * @param {ol.layer.Base} layerCandidate The layer filter candidate.
 * @return {Boolean} Whether the layer is hoverable or not.
 */
  const layerFilter = (layerCandidate: OlLayer) => {
    const source: any = layerCandidate.getSource();
    const isHoverable: boolean = layerCandidate.get('hoverable');
    const isSupportedHoverSource: boolean = source instanceof OlSourceImageWMS ||
      source instanceof OlSourceTileWMS || source instanceof OlSourceVector;
    return isHoverable && isSupportedHoverSource;
  };

  return (
    <ToggleButton
      type={type}
      shape={shape}
      iconName={iconName}
      pressedIconName={iconName}
      tooltip={tooltip}
      tooltipPlacement={tooltipPlacement}
      {...passThroughProps}
    />
  );
};

export default HsiButton;
