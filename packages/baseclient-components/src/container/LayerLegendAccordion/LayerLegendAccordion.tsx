import * as React from 'react';

import OlLayerGroup from 'ol/layer/Group';
import OlVectorLayer from 'ol/layer/Vector';
import OlTileWmsSource from 'ol/source/TileWMS';
import OlImageWmsSource from 'ol/source/Image';

const _isEqual = require('lodash/isEqual');
const _groupBy = require('lodash/groupBy');
const _uniqueId = require('lodash/uniqueId');

import {
  Collapse,
  Tooltip,
  Dropdown
} from 'antd';
const Panel = Collapse.Panel;

import {
  LayerTransparencySlider,
  LayerTree,
  Legend,
  Titlebar
} from '@terrestris/react-geo';

import {
  MapUtil
} from '@terrestris/ol-util';

import './LayerLegendAccordion.less';

// default props
interface DefaultLayerLegendAccordionProps {
  title: string;
  treeNodeFilter: (layer: any, index: number, array: any[]) => any;
  extraLegensParams: Object;
  mapLayers: any[];
  revision: number;
}

interface LayerLegendAccordionProps extends Partial<DefaultLayerLegendAccordionProps>{
  map: any;
  t: (arg: string) => {};
}

interface LayerLegendAccordionState {
  loadingQueue: string[];
  activeKeys: string[];
}

/**
 * Class representing the LayerLegendAccordion.
 *
 * @class LayerLegendAccordion
 * @extends React.Component
 */
export default class LayerLegendAccordion extends React.Component<LayerLegendAccordionProps, LayerLegendAccordionState> {

  public static defaultProps: DefaultLayerLegendAccordionProps = {
    title: 'LayerTree',
    treeNodeFilter: () => true,
    extraLegensParams: {
      'LEGEND_OPTIONS': 'fontAntiAliasing:true;forceLabels:on;fontName:DejaVu Sans Condensed'
    },
    mapLayers: [],
    revision: 0
  };

  private _mapLayerGroup : any;

  /**
   * Create the LayerLegendAccordion.
   *
   * @constructs LayerLegendAccordion
   */
  constructor(props: LayerLegendAccordionProps) {
    super(props);

    this.state = {
      loadingQueue: [],
      activeKeys: ['tree', 'legend']
    }

    this._mapLayerGroup = new OlLayerGroup({
      layers: props.mapLayers
    });

    this.treeNodeTitleRenderer = this.treeNodeTitleRenderer.bind(this);
    this.getLegendItems = this.getLegendItems.bind(this);
    this.loadingStartHandler = this.loadingStartHandler.bind(this);
    this.loadingEndHandler = this.loadingEndHandler.bind(this);
    this.onAllLayersVisibleChange = this.onAllLayersVisibleChange.bind(this);
    this.onAccordionChange = this.onAccordionChange.bind(this);
    this.onLayerTreeNodeVisibilityChange = this.onLayerTreeNodeVisibilityChange.bind(this);
    this.registerLoadingEventsForOlLayer = this.registerLoadingEventsForOlLayer.bind(this);
  }

  /**
   *
   */
  componentDidMount() {
    const { mapLayers } = this.props;
    mapLayers!
      .filter((layer: any) => !(layer instanceof OlVectorLayer) && !(layer instanceof OlLayerGroup))
      .forEach((layer: any) => this.registerLoadingEventsForOlLayer(layer, true));
  }

  /**
   *
   */
  componentWillUnmount() {
    const { mapLayers } = this.props;
    mapLayers!
      .filter((layer: any) => !(layer instanceof OlVectorLayer) && !(layer instanceof OlLayerGroup))
      .forEach((layer: any) => this.registerLoadingEventsForOlLayer(layer, false));
  }

  /**
   *
   * @param prevProps
   * @param prevState
   */
  componentDidUpdate(prevProps: any, prevState: any) {
    if (!this.state.loadingQueue || !prevState.loadingQueue) {
      return;
    }
    if (!_isEqual(this.state.loadingQueue, prevState.loadingQueue)) {
      const groupingFn = (p: string) => `${p.split('_')[1]}-${p.indexOf('tile') > -1 ? 'tile' : 'image'}`;

      const prevGrouped = _groupBy(prevState.loadingQueue, groupingFn);
      const currentGrouped = _groupBy(this.state.loadingQueue, groupingFn);

      if (!_isEqual(Object.keys(prevGrouped), Object.keys(currentGrouped))) {
        this.props.map.dispatchEvent('moveend');
      }
    }

    if (prevProps.revision && this.props.revision && !_isEqual(prevProps.revision, this.props.revision)) {
      this.forceUpdate();
    }
  }

  /**
   * Register loadstart and loadend handler for ImageWMS and TileWMS layers
   * @param {OlLayer} layer The OpenLayers layer to register listener for
   * @param {boolean} mode The mode: true => register handler, false => unregister handler
   */
  registerLoadingEventsForOlLayer(layer: any, mode: boolean) {
    const layerSource = layer.getSource();

    if (layerSource instanceof OlTileWmsSource) {
      if (mode) {
        layerSource.on('tileloadstart', this.loadingStartHandler);
        layerSource.on('tileloadend', this.loadingEndHandler);
        // on error: stop loading indicator for current tile
        layerSource.on('tileloaderror', this.loadingEndHandler);
        return;
      } else {
        layerSource.un('tileloadstart', this.loadingStartHandler);
        layerSource.un('tileloadend', this.loadingEndHandler);
        // on error: stop loading indicator for current tile
        layerSource.un('tileloaderror', this.loadingEndHandler);
        return;
      }
    }
    if (layerSource instanceof OlImageWmsSource) {
      if (mode) {
        layerSource.on('imageloadstart', this.loadingStartHandler);
        layerSource.on('imageloadend', this.loadingEndHandler);
        // on error: stop loading indicator for current image
        layerSource.on('imageloaderror', this.loadingEndHandler);
        return;
      } else {
        layerSource.un('imageloadstart', this.loadingStartHandler);
        layerSource.un('imageloadend', this.loadingEndHandler);
        // on error: stop loading indicator for current image
        layerSource.un('imageloaderror', this.loadingEndHandler);
        return;
      }
    }
  }

  /**
   * The handler called if tile / image starts loading
   * @param evt The event
   */
  loadingStartHandler(evt: any) {
    const layerNames = evt.target.getParams().LAYERS;

    if (evt.target instanceof OlTileWmsSource) {
      this.setState(prevState => ({
        loadingQueue: [...prevState.loadingQueue, `tile-${evt.tile.ol_uid}_${layerNames}`]
      }))
    }
    if (evt.target instanceof OlImageWmsSource) {
      this.setState(prevState => ({
        loadingQueue: [...prevState.loadingQueue, `IMAGEWMS_${layerNames}`]
      }))
    }
  }

  /**
   * The handler called if tile / image is loaded / has thrown an error
   * @param evt The event
   */
  loadingEndHandler(evt: any) {
    const { loadingQueue } = this.state;
    const layerNames = evt.target.getParams().LAYERS;

    if (evt.target instanceof OlTileWmsSource) {
      this.setState({
        loadingQueue: loadingQueue.filter((lq: string) => lq !== `tile-${evt.tile.ol_uid}_${layerNames}`)
      })
    }
    if (evt.target instanceof OlImageWmsSource) {
      this.setState({
        loadingQueue: loadingQueue.filter((lq: string) => lq !== `IMAGEWMS_${layerNames}`)
      })
    }
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
      t
    } = this.props;

    const {
      loadingQueue
    } = this.state;

    const visibilityClass = layer.getVisible() ?
      'fa-eye layer-tree-node-title-active' :
      'fa-eye-slash layer-tree-node-title-inactive';
    const visibilitySpanClass = `fa ${visibilityClass} layer-tree-node-title-visibility`;

    if (layer instanceof OlLayerGroup) {
      return (
        <span
          className="layer-tree-node-title"
        >
          <Tooltip
            title={t('LayerLegendAccordion.toggleVisibilityTooltipText')}
            placement="right"
            mouseEnterDelay={0.5}
          >
            <span
              className={visibilitySpanClass}
              onClick={() => this.onLayerTreeNodeVisibilityChange(layer)}
            />
          </Tooltip>
          <Tooltip
            title={layer.get('name')}
            placement="top"
            mouseEnterDelay={0.5}
          >
            <span
              className="layer-tree-node-title-layername"
            >
              {layer.get('name')}
            </span>
          </Tooltip>
        </span>
      );
    }

    let loading;
    if (layer &&
      layer.getVisible() &&
      (layer.getSource() instanceof OlImageWmsSource || layer.getSource() instanceof OlTileWmsSource)) {
      const wmsSource: any = layer.getSource();
      const encodedLayerNames = wmsSource.getParams().LAYERS;
      loading = loadingQueue!.find((e: string) => e.indexOf(encodedLayerNames) > -1);
    }
    const loadingSpanClass = `fa fa-spinner fa-spin layer-tree-node-loading-${loading ? 'active' : 'inactive'}`;

    return (
      <span
        className="layer-tree-node-list-item"
      >
        <div className="layer-tree-node-title">
        <Tooltip
          title={t('LayerLegendAccordion.toggleVisibilityTooltipText')}
          placement="right"
          mouseEnterDelay={0.5}
        >
          <span
            className={visibilitySpanClass}
            onClick={() => this.onLayerTreeNodeVisibilityChange(layer)}
          />
        </Tooltip>
        <Tooltip
          title={layer.get('name')}
          placement="top"
          mouseEnterDelay={0.5}
        >
          <span
            className="layer-tree-node-title-layername"
          >
            {layer.get('name')}
          </span>
        </Tooltip>
        <span
          className={loadingSpanClass}
        />
        {
          !(layer instanceof OlLayerGroup) ?
            <Dropdown
              overlay={<div />} // TODO: make something more senseful here
              placement="topLeft"
              trigger={['click']}
            >
              <Tooltip
                title={this.props.t('LayerLegendAccordion.layerSettingsTooltipText')}
                placement="right"
                mouseEnterDelay={0.5}
              >
                <span
                  className="fa fa-cog layer-tree-node-title-settings"
                />
              </Tooltip>
            </Dropdown> :
            null
          }
          </div>
          <LayerTransparencySlider
            layer={layer}
          />
      </span>
    );
  }

  /**
   * Generate legend items for currently visible layers on map
   *
   * @returns {Collapse[]} An array of collapsible Instances of <Legend>
   */
  getLegendItems() {
    const {
      mapLayers,
      map,
      extraLegensParams
    } = this.props;
    if (!map || !mapLayers) {
      return null;
    }
    const unit = map.getView().getProjection().getUnits();
    const scale = MapUtil.getScaleForResolution(map.getView().getResolution(), unit);

    // clone the array, reverse will work in place
    const reversed = mapLayers.slice(0).reverse().filter((l: any) => l && l.getVisible());
    const legends = reversed.map((l: any) => {
      return (
        <Collapse
          key={_uniqueId('collapse-')}
          bordered={false}
          destroyInactivePanel={true}
        >
          <Panel
            key={_uniqueId('panel-')}
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
    if (!layers) {
      return 'fa fa-eye-slash all-layers-handle';
    }
    const filteredLayers = layers.filter(this.props.treeNodeFilter!);
    if (!filteredLayers) {
      return 'fa fa-eye-slash all-layers-handle';
    }
    const numLayers = filteredLayers.length;
    let visibleLayers = 0;
    filteredLayers.forEach(l => {
      if (l && l.getVisible() === true) {
        visibleLayers++;
      }
    });
    if (visibleLayers === 0) {
      return 'fa fa-eye-slash all-layers-handle';
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
    if (layerVisibilityClassName.indexOf('some-layers') > -1 ) {
      visibility = true;
    }
    if (layerVisibilityClassName.indexOf('fa-eye-slash') > -1) {
      visibility = true;
    }
    // update all layers
    filteredLayers.forEach(l => l.setVisible(visibility));

    // we need to do this since legend needs to be redrawn
    this.forceUpdate();
  }

  /**
   * Handler called if visibility of a certain layers is changed
   * @param {OlLayer[]} layer The layer for which the visibility has to be changed
   */
  onLayerTreeNodeVisibilityChange(layer: any) {
    const nextLayerVisibility = !layer.getVisible();
    layer.setVisible(nextLayerVisibility);

    // we need to do this since legend needs to be redrawn
    this.forceUpdate();
  }

  /**
   * Change handler for accordion
   * @param {string[]} activeKeys The keys of the panels that should be visible afterwards
   */
  onAccordionChange(activeKeys: string[]) {
    this.setState({ activeKeys });
  }

  /**
   * The render function
   */
  render() {
    const {
      map,
      mapLayers,
      t
    } = this.props;

    const {
      activeKeys
    } = this.state;

    const layerVisibilityClassName = this.getLayerVisiblilityClassName(mapLayers);

    return (
      <Collapse
        className="layer-legend-accordion"
        bordered={false}
        activeKey={activeKeys}
        destroyInactivePanel={true}
        onChange={this.onAccordionChange}
      >
        <Panel
          header={
            <Titlebar className="layer-legend-accordion-title">
              <span>{t('LayerLegendAccordion.layerTreeTilte')}</span>
            </Titlebar>
          }
          key="tree"
          className="layertree-collapse-panel"
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
          <LayerTree
            map={map}
            layerGroup={this._mapLayerGroup}
            nodeTitleRenderer={this.treeNodeTitleRenderer}
            filterFunction={this.props.treeNodeFilter}
          />
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
