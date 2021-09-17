import * as React from 'react';
import { connect } from 'react-redux';

import OlLayerGroup from 'ol/layer/Group';

const isEqual = require('lodash/isEqual');
const groupBy = require('lodash/groupBy');

import {
  Collapse
} from 'antd';
const Panel = Collapse.Panel;

import LayerTree from '@terrestris/react-geo/dist/LayerTree/LayerTree';
import Legend from '@terrestris/react-geo/dist/Legend/Legend';
import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';
import Titlebar from '@terrestris/react-geo/dist/Panel/Titlebar/Titlebar';

import {
  MapUtil
} from '@terrestris/ol-util';

import './LayerLegendAccordion.css';

import LayerLegendAccordionTreeNode from '../../LayerLegendAccordionTreeNode/LayerLegendAccordionTreeNode';
import { toggleAddLayerWindow } from '../../../state/appState/actions';

// default props
interface DefaultLayerLegendAccordionProps {
  title: string;
  treeNodeFilter: (layer: any, index: number, array: any[]) => any;
  extraLegensParams: Object;
  mapLayers: any[];
  externalLayerGroup: OlLayerGroup;
  baseLayer: any;
  revision: number;
  onTopicLayerDragEnd: () => void;
}

interface LayerLegendAccordionProps extends Partial<DefaultLayerLegendAccordionProps> {
  map: any;
  dispatch: (arg: any) => void;
  t: (arg: string) => string;
}

interface LayerLegendAccordionState {
  loadingQueue: string[];
  mainAccordionActiveKeys: string[];
  themeLayerActiveKeys: string[];
  baseLayerActiveKeys: string[];
  externalLayerActiveKeys: string[];
  legendImageActiveKeys: string[];
}

/**
 * Class representing the LayerLegendAccordion.
 *
 * @class LayerLegendAccordion
 * @extends React.Component
 */
export class LayerLegendAccordion extends React.Component<LayerLegendAccordionProps, LayerLegendAccordionState> {

  public static defaultProps: DefaultLayerLegendAccordionProps = {
    title: 'LayerTree',
    treeNodeFilter: () => true,
    extraLegensParams: {
      'LEGEND_OPTIONS': 'fontAntiAliasing:true;forceLabels:on;fontName:DejaVu Sans Condensed'
    },
    mapLayers: [],
    externalLayerGroup: new OlLayerGroup(),
    baseLayer: null,
    revision: 0,
    onTopicLayerDragEnd: () => { }
  };

  private _mapLayerGroup: any;
  private _baseLayerGroup: any;

  /**
   * Create the LayerLegendAccordion.
   *
   * @constructs LayerLegendAccordion
   */
  constructor(props: LayerLegendAccordionProps) {
    super(props);

    this.state = {
      loadingQueue: [],
      mainAccordionActiveKeys: ['tree', 'legend'],
      themeLayerActiveKeys: ['theme'],
      baseLayerActiveKeys: [],
      externalLayerActiveKeys: [],
      legendImageActiveKeys: []
    };

    this._mapLayerGroup = new OlLayerGroup({
      layers: props.mapLayers
    });

    if (props.baseLayer) {
      this._baseLayerGroup = new OlLayerGroup({
        layers: [props.baseLayer]
      });
    }

    this.treeNodeTitleRenderer = this.treeNodeTitleRenderer.bind(this);
    this.getLegendItems = this.getLegendItems.bind(this);
    this.onAllLayersVisibleChange = this.onAllLayersVisibleChange.bind(this);
    this.onLayerLegendAccordionChange = this.onLayerLegendAccordionChange.bind(this);
    this.onThemeLayerAccordionChange = this.onThemeLayerAccordionChange.bind(this);
    this.onBaseLayerAccordionChange = this.onBaseLayerAccordionChange.bind(this);
    this.onExternalLayerAccordionChange = this.onExternalLayerAccordionChange.bind(this);
    this.onLegendImageAccordionChange = this.onLegendImageAccordionChange.bind(this);
    this.onAddLayerClick = this.onAddLayerClick.bind(this);
  }

  /**
   * The componentDidUpdate lifecycle function
   *
   * @param prevProps
   * @param prevState
   */
  componentDidUpdate(prevProps: any, prevState: any) {
    if (!this.state.loadingQueue || !prevState.loadingQueue) {
      return;
    }
    if (!isEqual(this.state.loadingQueue, prevState.loadingQueue)) {
      const groupingFn = (p: string) => `${p.split('_')[1]}-${p.indexOf('tile') > -1 ? 'tile' : 'image'}`;

      const prevGrouped = groupBy(prevState.loadingQueue, groupingFn);
      const currentGrouped = groupBy(this.state.loadingQueue, groupingFn);

      if (!isEqual(Object.keys(prevGrouped), Object.keys(currentGrouped))) {
        this.props.map.dispatchEvent('moveend');
      }
    }
  }

  /**
   * Check if revision changed, if so: update private _mapLayerGroup
   * @param prevProps
   */
  getSnapshotBeforeUpdate(prevProps: any): null {
    if (!isEqual(prevProps.revision, this.props.revision)) {
      if (this.props.mapLayers && this.props.mapLayers.length !== 0) {
        const layersCollection = this._mapLayerGroup.getLayers();
        layersCollection.clear();
        layersCollection.extend(this.props.mapLayers);
      }
      if (this.props.baseLayer) {
        const baseLayerCollection = this._baseLayerGroup.getLayers();
        baseLayerCollection.clear();
        baseLayerCollection.extend([this.props.baseLayer]);
      }
      this.forceUpdate();
      return null;
    }

    return null;
  }

  /**
   * Custom tree node renderer function containing:
   * * Eye symbol indicating layers visiblity
   * * Layer Name
   * * Loading indicator (spinning)
   * * Cog symbol to access layer's properties
   *
   * @param {OlLayer} layer The OpenLayers layer the tree node should be rendered for
   */
  treeNodeTitleRenderer(layer: any) {
    const {
      t,
      map
    } = this.props;

    return (
      <LayerLegendAccordionTreeNode
        map={map}
        t={t}
        layer={layer}
      />
    );
  }

  /**
   * Generate legend items for currently visible layers on map
   *
   * @returns {Collapse[]} An array of collapsible Instances of <Legend>
   */
  getLegendItems() {
    const {
      baseLayer,
      mapLayers,
      map,
      extraLegensParams
    } = this.props;

    const {
      legendImageActiveKeys
    } = this.state;
    if (!map || !mapLayers) {
      return null;
    }
    const unit = map.getView().getProjection().getUnits();
    const scale = MapUtil.getScaleForResolution(map.getView().getResolution(), unit);

    // clone the array, reverse will work in place
    const reversed = mapLayers.slice(0).reverse().filter((l: any) => l && l.getVisible());
    if (baseLayer) {
      reversed.push(baseLayer);
    }

    const legends = reversed.map((l: any) => {
      const panelKey = l.ol_uid;
      return (
        <Collapse
          key={panelKey}
          bordered={false}
          destroyInactivePanel={true}
          activeKey={legendImageActiveKeys}
          onChange={this.onLegendImageAccordionChange}
        >
          <Panel
            key={panelKey}
            header={l.get('name')}
          >
            <Legend
              key={l.getRevision()}
              layer={l}
              extraParams={{
                scale,
                WIDTH: 30 * 1.5,
                HEIGHT: 30,
                TRANSPARENT: true,
                ...extraLegensParams
              }}
            />
          </Panel>
        </Collapse>
      );
    });

    return (
      <div>
        {legends}
      </div>
    );
  }

  /**
   * Returns css class name for visibility class of all layers
   *
   * @param {OlLayer[]} layers The OpenLayers layers to get the class names for
   */
  getLayerVisiblilityClassName(layers: any[] | undefined) {
    const fallbackCls = 'fa fa-eye-slash all-layers-handle';
    if (!layers) {
      return fallbackCls;
    }
    const filteredLayers = layers.filter(this.props.treeNodeFilter!);
    if (!filteredLayers) {
      return fallbackCls;
    }
    const numLayers = filteredLayers.length;
    let visibleLayers = 0;
    filteredLayers.forEach(l => {
      if (l && l.getVisible() === true) {
        visibleLayers++;
      }
    });
    if (visibleLayers === 0) {
      return fallbackCls;
    }

    return visibleLayers === numLayers ? 'fa fa-eye all-layers-handle' : 'fa fa-eye some-layers all-layers-handle';
  }

  /**
   * Handler called when visiblity of all layers is changed
   *
   * @param {OlLayer[]} The OpenLayes layers to change visiblity for
   */
  onAllLayersVisibleChange(mapLayers: any[] | undefined) {
    if (!mapLayers) {
      return;
    }
    const filteredLayers = mapLayers.filter(this.props.treeNodeFilter!);
    const layerVisibilityClassName: string = this.getLayerVisiblilityClassName(mapLayers);
    let visibility = false;
    if (layerVisibilityClassName.indexOf('some-layers') > -1) {
      visibility = true;
    }
    if (layerVisibilityClassName.indexOf('fa-eye-slash') > -1) {
      visibility = true;
    }
    // update all layers
    filteredLayers.forEach(l => l.setVisible(visibility));
    this.props.map.dispatchEvent('nodeVisibilityChanged');

    // we need to do this since legend needs to be redrawn
    this.forceUpdate();
  }

  /**
   * Change handler for main layer legend accordion
   * @param {string[]} mainAccordionActiveKeys The panel keys which should be visible afterwards.
   */
  onLayerLegendAccordionChange(mainAccordionActiveKeys: string[]) {
    this.setState({ mainAccordionActiveKeys });
  }

  /**
   * Change handler for theme layers accordion.
   * @param {string[]} themeLayerActiveKeys The panel keys which should be visible afterwards.
   */
  onThemeLayerAccordionChange(themeLayerActiveKeys: string[]) {
    this.setState({ themeLayerActiveKeys });
  }

  /**
   * Change handler for base layers accordion.
   * @param {string[]} baseLayerActiveKeys The panel keys which should be visible afterwards.
   */
  onBaseLayerAccordionChange(baseLayerActiveKeys: string[]) {
    this.setState({ baseLayerActiveKeys });
  }

  /**
   * Change handler for external layers accordion.
   * @param {string[]} externalLayerActiveKeys The panel keys which should be visible afterwards.
   */
  onExternalLayerAccordionChange(externalLayerActiveKeys: string[]) {
    this.setState({ externalLayerActiveKeys });
  }

  /**
   * Change handler for legend images accordion.
   * @param {string[]} legendImageActiveKeys The panel keys which should be visible afterwards.
   */
  onLegendImageAccordionChange(legendImageActiveKeys: string[]) {
    this.setState({ legendImageActiveKeys });
  }

  /**
   *
   */
  onAddLayerClick(evt: React.MouseEvent) {
    // Avoid collapsing/expanding the Accordion
    evt.stopPropagation();
    this.props.dispatch(toggleAddLayerWindow());
  }

  /**
   * The render function
   */
  render() {
    const {
      externalLayerGroup,
      map,
      mapLayers,
      t,
      onTopicLayerDragEnd
    } = this.props;

    const {
      mainAccordionActiveKeys,
      themeLayerActiveKeys,
      baseLayerActiveKeys,
      externalLayerActiveKeys
    } = this.state;

    const layerVisibilityClassName = this.getLayerVisiblilityClassName(mapLayers);

    return (
      <Collapse
        className="layer-legend-accordion"
        bordered={false}
        activeKey={mainAccordionActiveKeys}
        destroyInactivePanel={true}
        onChange={this.onLayerLegendAccordionChange}
      >
        <Panel
          header={
            <Titlebar
              className="layer-legend-accordion-title"
              tools={[
                <SimpleButton
                  iconName={['fas', 'plus']}
                  tooltip={t('LayerLegendAccordion.addLayer') as string}
                  key="add-layer"
                  onClick={this.onAddLayerClick}
                />
              ]}
            >
              <span>{t('LayerLegendAccordion.layerTreeTitle')}</span>
            </Titlebar>
          }
          key="tree"
          className="layerlist-collapse-panel"
        >
          <span
            className={layerVisibilityClassName}
            onClick={(event: React.MouseEvent) => {
              this.onAllLayersVisibleChange(mapLayers);
              event.preventDefault();
            }}
          >
            <span>{layerVisibilityClassName !== 'fa fa-eye all-layers-handle' ?
              t('LayerLegendAccordion.activateAllLayersText') :
              t('LayerLegendAccordion.deactivateAllLayersText')}
            </span>
          </span>
          {
            externalLayerGroup.getLayers().getArray().length > 0 &&
            <Collapse
              bordered={false}
              destroyInactivePanel={true}
              activeKey={externalLayerActiveKeys}
              onChange={this.onExternalLayerAccordionChange}
            >
              <Panel
                header={t('LayerLegendAccordion.externalText')}
                key="theme"
                className="layer-collapse-panel"
              >
                <LayerTree
                  map={map}
                  layerGroup={externalLayerGroup}
                  nodeTitleRenderer={this.treeNodeTitleRenderer}
                  filterFunction={this.props.treeNodeFilter}
                  onDragEnd={onTopicLayerDragEnd}
                />
              </Panel>
            </Collapse>
          }
          {
            this._mapLayerGroup.getLayers().getArray().length > 0 &&
            <Collapse
              bordered={false}
              destroyInactivePanel={true}
              activeKey={themeLayerActiveKeys}
              onChange={this.onThemeLayerAccordionChange}
            >
              <Panel
                header={t('LayerSetBaseMapChooser.topicText')}
                key="theme"
                className="layer-collapse-panel"
              >
                <LayerTree
                  map={map}
                  layerGroup={this._mapLayerGroup}
                  nodeTitleRenderer={this.treeNodeTitleRenderer}
                  filterFunction={this.props.treeNodeFilter}
                  onDragEnd={onTopicLayerDragEnd}
                />
              </Panel>
            </Collapse>
          }
          {
            this._baseLayerGroup &&
            <Collapse
              bordered={false}
              destroyInactivePanel={true}
              activeKey={baseLayerActiveKeys}
              onChange={this.onBaseLayerAccordionChange}
            >
              <Panel
                header={t('LayerSetBaseMapChooser.baseLayerText')}
                key="base"
                className="layer-collapse-panel"
              >
                <LayerTree
                  map={map}
                  layerGroup={this._baseLayerGroup}
                  nodeTitleRenderer={this.treeNodeTitleRenderer}
                  draggable={false}
                />
              </Panel>
            </Collapse>
          }
        </Panel>
        <Panel
          header={
            <Titlebar className="layer-legend-accordion-title">
              <span>{t('LayerLegendAccordion.legendPanelTitle')}</span>
            </Titlebar>
          }
          key="legend"
          className="legend-collapse-panel"
        >
          {this.getLegendItems()}
        </Panel>
      </Collapse>
    );
  }
}

export default connect()(LayerLegendAccordion);
