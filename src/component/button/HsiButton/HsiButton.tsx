import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import ToggleButton, { ToggleButtonProps } from '@terrestris/react-geo/dist/Button/ToggleButton/ToggleButton';

import OlMap from 'ol/Map';
import OlView from 'ol/View';
import OlProjection from 'ol/proj/Projection';
import OlFeature from 'ol/Feature';
import OlMapBrowserEvent from 'ol/MapBrowserEvent';
import OlGeometry from 'ol/geom/Geometry';
import OlLayer from 'ol/layer/Layer';

import { LayerType } from '../../../util/types';
import { BaseClientState } from '../../../state/reducer';
import { DataRange } from '../../../state/dataRange';
import {
  clearFeatures,
  abortFetchingFeatures,
  fetchFeatures
} from '../../../state/remoteFeatures/actions';

import { WmsLayer } from '@terrestris/react-geo/dist/Util/typeUtils';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfo } from '@fortawesome/free-solid-svg-icons';

interface DefaultHsiButtonProps extends Partial<ToggleButtonProps> {
  dataRange?: DataRange;
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
  /**
   * Maximum number of features to retrieve. Defaults to 10.
   */
  featureCount?: number;
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
  tooltip = 'Feature Info',
  tooltipPlacement = 'right',
  getInfoByClick = false,
  onToggleCb = undefined,
  featureCount = 10,
  ...passThroughProps
}): React.ReactElement => {

  const dispatch = useDispatch();
  const dataRange = useSelector((state: BaseClientState) => state.dataRange);

  const [pressed, setPressed] = useState<boolean>(false);

  /**
   * Calls a GFI request to all hoverable (or the uppermost only, if `drillDown`
   * is set to false property) layer(s).
   *
   * @param {ol.MapEvent} olEvt The `pointerrest` event.
   */
  // TODO Add type for pointerrest
  const getInfo = useCallback((olEvt: OlMapBrowserEvent<any>) => {
    const mapView: OlView = map.getView();
    const viewResolution: number = mapView.getResolution();
    const viewProjection: OlProjection = mapView.getProjection();
    let pixel: number[];
    if (getInfoByClick) {
      pixel = olEvt.pixel;
    } else {
      pixel = map.getEventPixel(olEvt.originalEvent);
    }
    let internalVectorFeatures: { [name: string]: OlFeature<OlGeometry>[] } = {};
    const featureInfoUrls: string[] = [];

    // dispatch that any running HOVER process should be canceled
    dispatch(abortFetchingFeatures('HOVER'));

    const mapLayers =
      map.getAllLayers()
        .filter(layerFilter);
    mapLayers.forEach((layer: OlLayer) => {
      const layerSource = (layer as WmsLayer).getSource();
      if (!layerSource) {
        return;
      }
      const coordinate: number[] = map.getCoordinateFromPixel(pixel);

      // @ts-ignore
      if (layer.getSource().getFeatures) {
        internalVectorFeatures[layer.get('name')] = [];
        const internalFeatures = olEvt.map.getFeaturesAtPixel(pixel, {
          layerFilter: (layerCandidate: LayerType) => {
            return layerCandidate === layer;
          }
        });

        if (!internalFeatures.length) {
          return;
        }
        internalVectorFeatures[layer.get('name')] =
          internalFeatures.map((feat: OlFeature<OlGeometry>) => feat.clone());
        featureInfoUrls.push(`internal://${layer.get('name')}`);
        return;
      }
      // @ts-ignore
      if (!layerSource.getFeatureInfoUrl) {
        return;
      }

      let featureInfoUrl: string;
      if (layer.get('type') === 'WMSTime') {
        // @ts-ignore
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
        // @ts-ignore
        featureInfoUrl = layerSource.getFeatureInfoUrl(
          map.getCoordinateFromPixel(pixel),
          viewResolution,
          viewProjection,
          {
            // TODO add check for json format availability
            INFO_FORMAT: 'application/json',
            FEATURE_COUNT: featureCount
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
  }, [dataRange.endDate, dataRange.startDate, dispatch, drillDown, featureCount, getInfoByClick, map]);

  useEffect(() => {
    if (pressed) {
      if (getInfoByClick) {
        map.on('click', getInfo);
      } else {
        // @ts-ignore
        map.on('pointerrest', getInfo);
      }
      if (onToggleCb) {
        onToggleCb();
      }
      // remove possible hover artifacts
      dispatch(clearFeatures('HOVER'));
    }
    return () => {
      if (getInfoByClick) {
        map.un('click', getInfo);
      } else {
        // @ts-ignore
        map.un('pointerrest', getInfo);
      }
      // remove possible hover artifacts
      dispatch(clearFeatures('HOVER'));
    };
  }, [dispatch, getInfo, getInfoByClick, map, onToggleCb, pressed]);

  /**
   * Manage toggled state.
   */
  const onHsiToggle = (toggled: boolean) => {
    setPressed(toggled);
  };

  /**
 * Checks if a given layer is hoverable or not.
 *
 * @param {ol.layer.Base} layerCandidate The layer filter candidate.
 * @return {Boolean} Whether the layer is hoverable or not.
 */
  const layerFilter = (layerCandidate: LayerType) => {
    interface UnknownOlSource {
      getImageLoadFunction?: any;
      getTileGrid?: any;
      getFeatures?: any;
      getMatrixSet?: any;
    }
    const source = layerCandidate.getSource() as UnknownOlSource;
    const isHoverable: boolean = layerCandidate.get('hoverable');
    const isVisible: boolean = layerCandidate.getVisible();
    const isSupportedHoverSource: boolean =
      source.getImageLoadFunction || // 'ImageWMS'
      source.getTileGrid && !source.getMatrixSet || // 'TileWMS'
      source.getFeatures; // 'VectorSource'
    return isHoverable && isVisible && isSupportedHoverSource;
  };

  return (
    <ToggleButton
      type={type}
      shape={shape}
      icon={
        <FontAwesomeIcon
          icon={faInfo}
        />
      }
      pressedIcon={
        <FontAwesomeIcon
          icon={faInfo}
        />
      }
      tooltip={tooltip}
      tooltipPlacement={tooltipPlacement}
      onToggle={onHsiToggle}
      {...passThroughProps}
    />
  );
};

export default HsiButton;
