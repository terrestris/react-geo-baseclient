import React, { useEffect, useState } from 'react';

import OlMap from 'ol/Map';
import OlLayer from 'ol/layer/Base';
import OlSourceVector from 'ol/source/Vector';
import OlLayerVector from 'ol/layer/Vector';
import OlStyleStyle from 'ol/style/Style';
import OlStyleFill from 'ol/style/Fill';
import OlStyleStroke from 'ol/style/Stroke';
import OlStyleCircle from 'ol/style/Circle';
import OlFeature from 'ol/Feature';

import {
  Menu
} from 'antd';
const MenuItem = Menu.Item;

import { MenuInfo } from 'rc-menu/lib/interface';

import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';
import Window from '@terrestris/react-geo/dist/Window/Window';

const isEmpty = require('lodash/isEmpty');

import { MapUtil } from '@terrestris/ol-util/dist/MapUtil/MapUtil';
import FeatureInfoGrid from '../../FeatureInfoGrid/FeatureInfoGrid';
import { clearFeatures } from '../../../state/actions/RemoteFeatureAction';
import './FeatureInfo.css';

interface DefaultFeatureInfoProps {
  /**
   * The maximum number of menu items to display.
   * @type {Number}
   */
  maxMenuItems?: number;
}

interface FeatureInfoProps {
  /**
  * The features to render in the menu.
  * @type {Array}
   */
  features: {
    [key: string]: OlFeature[];
  };

  /**
   * The ol map.
   * @type {ol.Map}
   */
  map: OlMap;

  /**
   * Translate function
   */
  t: (arg: string) => string;

  /**
   * Dispatch function
   */
  dispatch: (arg: any) => void;

  /**
   * The window position.
   */
  windowPosition?: [number, number];

  /**
   * The window height.
   */
  windowHeight?: number;

  windowCollapsible?: boolean;
}

export type ComponentProps = DefaultFeatureInfoProps & FeatureInfoProps;

let hoverVectorLayer: OlLayerVector = null;

/**
 * The FeatureInfo Menu component.
 *
 * @class FeatureInfo.
 * @extends React.Component
 */
export const FeatureInfo: React.FC<ComponentProps> = ({
  features,
  map,
  t,
  dispatch,
  windowPosition = [50, 50],
  windowHeight = 300,
  windowCollapsible = true,
  maxMenuItems = 10,
  ...passThroughProps
}): JSX.Element => {

  const [menuHidden, setMenuHidden] = useState<boolean>(true);
  const [gridWinHidden, setGridWinHidden] = useState<boolean>(true);
  const [featuresToShow, setFeaturesToShow] = useState<OlFeature[]>([]);
  const [selectedFeatureType, setSelectedFeatureType] = useState<string>(null);
  const [downloadGridData, setDownloadGridData] = useState<boolean>(false);

  useEffect(() => {
    initHoverVectorLayer();
    return () => {
      if (hoverVectorLayer) {
        map.removeLayer(hoverVectorLayer);
        hoverVectorLayer.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {

    if (!hoverVectorLayer) {
      return;
    }

    const hoverFeatures: OlFeature[] = [];
    const featureTypes: string[] = Object.keys(features);
    featureTypes.slice(0, maxMenuItems).forEach((featTypeName: string) => {
      features[featTypeName].forEach((feat: any) => {
        hoverFeatures.push(feat);
      });
    });
    const hoverVectorSource: OlSourceVector = hoverVectorLayer.getSource();
    clearHoverLayerSource();
    hoverVectorSource.addFeatures(hoverFeatures);
    setMenuHidden(isEmpty(features));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [features]);

  /**
   * Style function for hover vector layer.
   * @param feat
   */
  const hoverStyleFunction = (feat: OlFeature): OlStyleStyle => {
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
  };

  /**
  * Initializes the vector layer that will be used to handle the hover
  * features on the map.
  */
  const initHoverVectorLayer = (): void => {
    if (!hoverVectorLayer) {
      const layer = new OlLayerVector({
        source: new OlSourceVector(),
        style: hoverStyleFunction
      });
      layer.set('name', 'hoverVectorLayer');
      hoverVectorLayer = layer;
      map.addLayer(hoverVectorLayer);
    }
  };

  /**
   * Clears the source of the hover vector layer.
   *
   * @param {Boolean} clearSelection Whether the features currently shown in
   *   feature info grid also should be cleared from source or not. Default is
   *   false.
   */
  const clearHoverLayerSource = (clearSelection: boolean = false): void => {
    const source = hoverVectorLayer.getSource();
    let hoverFeatures = source.getFeatures();
    if (!clearSelection) {
      hoverFeatures = hoverFeatures.filter((f: OlFeature) => f.get('selectedFeat') !== true);
    }
    hoverFeatures.forEach((hf: OlFeature) => {
      source.removeFeature(hf);
    });
  };

  /**
   * Resets the style of the hover vector features to the inital style.
   */
  const resetHoverLayerStyle = (): void => {
    const hoverFeatures: OlFeature[] = hoverVectorLayer.getSource().getFeatures();
    hoverFeatures.forEach((feat: OlFeature) => feat.setStyle(null));
  };

  /**
  * Called if the an item of the hover menu has been clicked.
  *
  * @param {React.MouseEvent} evt The click event.
  */
  const onMenuItemClick = (evt: MenuInfo): void => {
    const selectedFeatType = evt.key as string;
    const featsToShow: OlFeature[] = features[selectedFeatType];

    setMenuHidden(true);
    setFeaturesToShow(featsToShow);
    setGridWinHidden(false);
    setSelectedFeatureType(selectedFeatType);
  };

  /**
   * Renders a menu item for each feature type retrieved by GetFeatureInfo
   * request.
   *
   * @param {String} featType Original (qualified) feature type name.
   */
  const getMenuItemForFeatureType = (featType: string): React.ReactElement => {
    const layer: OlLayer = MapUtil.getLayerByNameParam(map, featType);
    const count: number = features[featType].length;

    return (
      <MenuItem
        key={featType}
        onMouseEnter={onMenuMouseEnter}
        onMouseLeave={onSubMenuMouseLeave}
      >
        {`${layer && layer.get('name') || featType} (${count})`}
      </MenuItem>
    );
  };

  /**
   * Called if the mouse enters a menu item.
   *
   * @param {React.MouseEvent} evt The mouseenter event.
   */
  const onMenuMouseEnter = (evt: MenuInfo): void => {
    const feats: OlFeature[] = features[evt.key];
    const highlightSource = hoverVectorLayer.getSource();
    highlightSource.addFeatures(feats.map((feat: OlFeature) => feat.clone()));
    resetHoverLayerStyle();
    setHoverLayerStyle(feats);
  };

  /**
   * Called if the mouse leaves a menu item.
   */
  const onSubMenuMouseLeave = (): void => {
    resetHoverLayerStyle();
    clearHoverLayerSource();
  };

  /**
   * Sets the hover style to the given features.
   *
   * @param {OlFeature} feats The features to set the style to.
   */
  const setHoverLayerStyle = (feats: OlFeature[]): void => {
    feats.forEach((feat: OlFeature) => feat.setStyle(hoverStyleFunction));
  };

  /**
  * Sets selectedFeatureType to null and hides feature info window.
   */
  const hideFeatureInfoWindow = (): void => {
    setSelectedFeatureType(null);
    setGridWinHidden(true);
    setFeaturesToShow([]);
    clearHoverLayerSource(true);
    dispatch(clearFeatures('HOVER'));
  };

  /**
   *
   */
  const handleDownloadButton = () => {
    setDownloadGridData(!downloadGridData);
  };

  const getTools = (layer: OlLayer): React.ReactElement[] => {
    const tools = [];
    if (layer && layer.get('type') === 'WMSTime') {
      tools.push(
        <SimpleButton
          iconName="fas fa-save"
          key="download-tool"
          size="small"
          tooltip={t('General.downloadData')}
          onClick={handleDownloadButton}
        />
      );
    }
    tools.push(
      <SimpleButton
        iconName="fas fa-times"
        key="close-tool"
        size="small"
        tooltip={t('General.close')}
        onClick={hideFeatureInfoWindow}
      />
    );
    return tools;
  };


  let winTitle;
  let layerToShow;

  if (selectedFeatureType) {
    layerToShow = MapUtil.getLayerByNameParam(map, selectedFeatureType);
    winTitle = layerToShow.get('name') || selectedFeatureType;
  }

  return (
    <div>
      {
        !gridWinHidden && selectedFeatureType &&
        <Window
          onEscape={hideFeatureInfoWindow}
          title={winTitle}
          minWidth={500}
          maxWidth={1000}
          height={windowHeight}
          maxHeight={1000}
          x={windowPosition[0]}
          y={windowPosition[1]}
          collapseTooltip={t('General.collapse')}
          collapsible={windowCollapsible}
          bounds="#app"
          tools={getTools(layerToShow)}
        >
          <FeatureInfoGrid
            map={map}
            isTimeLayer={layerToShow && layerToShow.get('type') === 'WMSTime'}
            features={featuresToShow}
            hoverVectorLayer={hoverVectorLayer}
            downloadGridData={downloadGridData}
            t={t}
          />
        </Window>
      }
      {
        !menuHidden && <Menu
          className="feature-info-menu"
          onClick={onMenuItemClick}
          {...passThroughProps}
        >
          {
            Object.keys(features).map(featType => getMenuItemForFeatureType(featType))
          }
        </Menu>
      }
    </div>
  );
};

export default FeatureInfo;
