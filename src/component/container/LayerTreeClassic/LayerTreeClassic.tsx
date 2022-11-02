import React from 'react';

import OlLayerGroup from 'ol/layer/Group';
import OlLayer from 'ol/layer/Base';
import OlImageLayer from 'ol/layer/Image';
import OlMap from 'ol/Map';

import LayerTree from '@terrestris/react-geo/dist/LayerTree/LayerTree';
import Legend from '@terrestris/react-geo/dist/Legend/Legend';
import LayerTransparencySlider from '@terrestris/react-geo/dist/Slider/LayerTransparencySlider/LayerTransparencySlider';
import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';
import LayerTreeApplyTimeInterval from '../../container/LayerTreeApplyTimeInterval/LayerTreeApplyTimeInterval';
import LayerTreeDropdownContextMenu from '../../container/LayerTreeDropdownContextMenu/LayerTreeDropdownContextMenu';

import { MapUtil } from '@terrestris/ol-util';

import './LayerTreeClassic.css';

import { hideLayerTree } from '../../../state/appState';

import _isBoolean from 'lodash/isBoolean';
import _isEmpty from 'lodash/isEmpty';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import ImageWMS from 'ol/source/ImageWMS';
import { isWmsLayer } from '@terrestris/react-geo/dist/Util/typeUtils';

interface DefaultLayerTreeClassicProps {
  extraLegendParams?: {};
  dispatch?: (arg: any) => void;
  showContextMenu?: boolean;
  showZoomToLayerExtent?: boolean;
  showZoomToLayerResolution?: boolean;
  showApplyTimeInterval?: boolean;
}

interface LayerTreeClassicProps {
  map: OlMap;
  t: (arg: string) => string;
  treeNodeFilter?: (value: any, index: number, array: any[]) => boolean;
}

type ComponentProps = DefaultLayerTreeClassicProps & LayerTreeClassicProps;

/**
 * Class representing a classic LayerTree with included Legend.
 *
 * @class LayerTreeClassic
 */
export const LayerTreeClassic: React.FC<ComponentProps> = ({
  extraLegendParams = {
    LEGEND_OPTIONS: 'fontAntiAliasing:true;forceLabels:on;fontName:DejaVu Sans Condensed',
    TRANSPARENT: true
  },
  dispatch = () => { },
  showContextMenu,
  showApplyTimeInterval = false,
  showZoomToLayerExtent = false,
  showZoomToLayerResolution = false,
  treeNodeFilter,
  t,
  map
}): JSX.Element => {

  /**
   * Checks if the layer's context menu is available for the certain layer.
   *
   * @param layer Layer entry.
   */
  const contextMenuAvailable = (layer: OlLayer) => {

    if (_isBoolean(showContextMenu)) {
      return showContextMenu;
    }

    const showDescription = !_isEmpty(layer.get('description'));
    const showMetadata = !_isEmpty(layer.get('metadataIdentifier')) &&
      layer.get('showMetadataInClient');

    return showDescription || showMetadata || showZoomToLayerExtent || showZoomToLayerResolution;
  };

  /**
   * Custom tree node renderer function
   * @param {OlImageLayer} layer The OpenLayers layer or LayerGroup the tree node
   *   should be rendered for
   */
  const treeNodeTitleRenderer = (layer: OlImageLayer<ImageWMS>) => {

    const unit = map.getView().getProjection().getUnits();
    const scale = MapUtil.getScaleForResolution(map.getView().getResolution(), unit);

    if (layer instanceof OlLayerGroup) {
      return (
        <div>
          {layer.get('name')}
        </div>
      );
    } else {
      const isInResolutionRange = MapUtil.layerInResolutionRange(layer, map);

      return (
        <div>
          <div className="classic-tree-node-header">
            <span
              className={isInResolutionRange ? undefined : 'layer-not-visible'}
            >
              {
                layer.get('name')
              }
            </span>
            <div className='classic-tree-node-header-buttons'>
              {(contextMenuAvailable(layer) && layer instanceof OlLayer) &&
                <LayerTreeDropdownContextMenu
                  map={map}
                  layer={layer}
                  showZoomToLayerExtent={showZoomToLayerExtent}
                  showZoomToLayerResolution={showZoomToLayerResolution}
                  t={t} />
              }
              {(showApplyTimeInterval && layer.get('type') === 'WMSTime') &&
                <LayerTreeApplyTimeInterval
                  map={map}
                  layer={layer}
                  t={t}
                />
              }
            </div>
          </div>
          {(layer.get('visible') && isInResolutionRange) &&
            <>
              <div className='layer-transparency'>
                {t('LayerTreeClassic.transparency')}
                <LayerTransparencySlider
                  layer={layer}
                />
              </div>
              {isWmsLayer(layer) &&
                <Legend
                  layer={layer}
                  errorMsg={t('LayerTreeClassic.brokenLegendText')}
                  extraParams={{
                    scale,
                    ...extraLegendParams
                  }}
                />
              }
            </>
          }
        </div>
      );
    }
  };

  return (
    <div className='layer-tree-classic'>
      <SimpleButton
        icon={
          <FontAwesomeIcon
            icon={faTimes}
          />
        }
        shape="circle"
        className="layer-tree-classic-close-button"
        size="small"
        onClick={() => dispatch(hideLayerTree())}
      />
      <LayerTree
        map={map}
        nodeTitleRenderer={treeNodeTitleRenderer}
        filterFunction={treeNodeFilter}
      />
    </div>
  );
};

export default LayerTreeClassic;
