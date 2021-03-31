import * as React from 'react';

import OlLayerGroup from 'ol/layer/Group';
import OlLayer from 'ol/layer/Base';

import LayerTree from '@terrestris/react-geo/dist/LayerTree/LayerTree';
import Legend from '@terrestris/react-geo/dist/Legend/Legend';
import LayerTransparencySlider from '@terrestris/react-geo/dist/Slider/LayerTransparencySlider/LayerTransparencySlider';
import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';
import LayerTreeApplyTimeInterval from '../../container/LayerTreeApplyTimeInterval/LayerTreeApplyTimeInterval';
import LayerTreeDropdownContextMenu from '../../container/LayerTreeDropdownContextMenu/LayerTreeDropdownContextMenu';

import {MapUtil} from '@terrestris/ol-util';

import './LayerTreeClassic.css';

import { hideLayerTree } from '../../../state/actions/AppStateAction';

import _isBoolean from 'lodash/isBoolean';
import _isEmpty from 'lodash/isEmpty';

interface DefaultLayerTreeClassicProps {
  extraLegendParams: {};
  dispatch: (arg: any) => void;
  showContextMenu?: boolean;
  showApplyTimeInterval: boolean;
}

interface LayerTreeClassicProps extends Partial<DefaultLayerTreeClassicProps> {
  map: any;
  t: (arg: string) => any;
  treeNodeFilter?: (value: any, index: number, array: any[]) => boolean;
}

/**
 * Class representing a classic LayerTree with included Legend.
 *
 * @class LayerTreeClassic
 * @extends React.Component
 */
export class LayerTreeClassic extends React.Component<LayerTreeClassicProps> {

  public static defaultProps: DefaultLayerTreeClassicProps = {
    extraLegendParams: {
      LEGEND_OPTIONS: 'fontAntiAliasing:true;forceLabels:on;fontName:DejaVu Sans Condensed',
      WIDTH: 30 * 1.5,
      HEIGHT: 30,
      TRANSPARENT: true
    },
    dispatch: () => {},
    showApplyTimeInterval: true
  };

  /**
   * @constructs LayerTreeClassic
   */
  constructor(props: LayerTreeClassicProps) {
    super(props);

    this.onHideLayerTree = this.onHideLayerTree.bind(this);
    this.showContextMenu = this.showContextMenu.bind(this);
  }

  /**
   * Currently only two context menu entries (description and metadata) are
   * expected. This check should be possibly extended in case of further entries
   * arrive.
   *
   * @param layer Layer entry.
   */
  showContextMenu(layer: OlLayer) {
    if (_isBoolean(this.props.showContextMenu)) {
      return this.props.showContextMenu;
    }

    const showDescription = !_isEmpty(layer.get('description'));
    const showMetadata = !_isEmpty(layer.get('metadataIdentifier')) &&
      layer.get('showMetadataInClient');

    return showDescription || showMetadata;
  }

  /**
   * Custom tree node renderer function
   * @param {any} layer The OpenLayers layer or LayerGroup the tree node
   *   should be rendered for
   */
  treeNodeTitleRenderer(layer: OlLayer) {
    const {
      map,
      extraLegendParams,
      t,
      showApplyTimeInterval
    } = this.props;

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
              {(this.showContextMenu(layer) && layer instanceof OlLayer) &&
                <LayerTreeDropdownContextMenu
                  map={this.props.map}
                  layer={layer}
                  t={t} />
              }
              {(showApplyTimeInterval && layer.get('type') === 'WMSTime') &&
                <LayerTreeApplyTimeInterval
                  map={this.props.map}
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
              <Legend
                layer={layer}
                errorMsg={t('LayerTreeClassic.brokenLegendText')}
                extraParams={{
                  scale,
                  ...extraLegendParams
                }}
              />
            </>
          }
        </div>
      );
    }
  }

  onHideLayerTree() {
    this.props.dispatch(hideLayerTree());
  }

  /**
   * The render function
   */
  render() {
    const {
      map
    } = this.props;

    return (
      <div className='layer-tree-classic'>
        <SimpleButton
          iconName="fas fa-times"
          shape="circle"
          className="layer-tree-classic-close-button"
          size="small"
          onClick={this.onHideLayerTree}
        />
        <LayerTree
          map={map}
          nodeTitleRenderer={this.treeNodeTitleRenderer.bind(this)}
          filterFunction={this.props.treeNodeFilter}
        />
      </div>
    );
  }
}

export default LayerTreeClassic;
