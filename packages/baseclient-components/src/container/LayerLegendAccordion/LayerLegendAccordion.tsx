import * as React from 'react';

import OlLayer from 'ol/layer/Layer';
import OlLayerGroup from 'ol/layer/Group';
import OlVectorLayer from 'ol/layer/Vector';
import OlTileWmsSource from 'ol/source/TileWMS';
import OlImageWmsSource from 'ol/source/Image';

import _isEqual from 'lodash/isEqual';
import _groupBy from 'lodash/groupBy';

import {
  Collapse,
  Tooltip,
  Dropdown,
  Icon
} from 'antd';
const Panel = Collapse.Panel;

import {
  LayerTree,
  Legend,
  SimpleButton,
  Titlebar
} from '@terrestris/react-geo';

import './LayerLegendAccordion.less';

// default props
interface DefaultLayerLegendAccordionProps {
  title: string;
}

interface LayerLegendAccordionProps extends Partial<DefaultLayerLegendAccordionProps>{
  map: any;
  t: (arg: string) => {};
}

interface LayerLegendAccordionState {
  loadingQueue: string[];
  activeKeys: string[];
  isCollapsed: boolean;
}

/**
 * Class representing the LayerLegendAccordion.
 *
 * @class LayerLegendAccordion
 * @extends React.Component
 */
export default class LayerLegendAccordion extends React.Component<LayerLegendAccordionProps, LayerLegendAccordionState> {

  /**
   * Create the LayerLegendAccordion.
   *
   * @constructs LayerLegendAccordion
   */
  constructor(props: LayerLegendAccordionProps) {
    super(props);

    this.state = {
      loadingQueue: [],
      activeKeys: ['tree', 'legend'],
      isCollapsed: false
    }

    this.treeNodeTitleRenderer = this.treeNodeTitleRenderer.bind(this);
    this.getLegendItems = this.getLegendItems.bind(this);
    this.loadingStartHandler = this.loadingStartHandler.bind(this);
    this.loadingEndHandler = this.loadingEndHandler.bind(this);
    this.onAllLayersVisibleChange = this.onAllLayersVisibleChange.bind(this);
    this.onAccordionChange = this.onAccordionChange.bind(this);
    this.onLayerTreeNodeVisibilityChange = this.onLayerTreeNodeVisibilityChange.bind(this);
  }

  /**
   *
   * @param The default props
   */
  public static defaultProps: DefaultLayerLegendAccordionProps = {
    title: 'LayerTree' // TODO: i18n
  };

  /**
   *
   */
  componentDidMount() {
    const { map } = this.props;
    map.getLayers().getArray()
      .filter((layer: OlLayer) => !(layer instanceof OlVectorLayer) && !(layer instanceof OlLayerGroup))
      .forEach((layer: OlLayer) => this.registerLoadingEventsForOlLayer(layer));
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
  }

  /**
   *
   * @param layer TODO: move to util
   */
  registerLoadingEventsForOlLayer(layer: OlLayer) {
    const layerSource = layer.getSource();
    if (layerSource instanceof OlTileWmsSource) {
      layer.getSource().on('tileloadstart', this.loadingStartHandler);
      layer.getSource().on('tileloadend', this.loadingEndHandler);
      layer.getSource().on('tileloaderror', this.loadingEndHandler); // TODO: error handler
      return;
    }
    if (layerSource instanceof OlImageWmsSource) {
      layer.getSource().on('imageloadstart', this.loadingStartHandler);
      layer.getSource().on('imageloadend', this.loadingEndHandler);
      layer.getSource().on('imageloaderror', this.loadingEndHandler); // TODO: error handler
      return;
    }
  }

  /**
   *
   * @param evt #
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
   *
   * @param evt
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
   *
   * @param layer
   */
  treeNodeTitleRenderer(layer: OlLayer) {
    const {
      t
    } = this.props;

    const {
      loadingQueue
    } = this.state;

    const visibilityClass = layer.getVisible() ? 'fa-eye layer-tree-node-title-active' : 'fa-eye-slash layer-tree-node-title-inactive';
    const visibilitySpanClass = `fa ${visibilityClass} layer-tree-node-title-visibility`;

    if (layer instanceof OlLayerGroup) {
      return <span
        className="layer-tree-node-title"
      >
        <Tooltip
          title={t('LayerTreePanel.toggleVisibilityTooltipText')}
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
      </span>;
    }

    let loading;
    if (layer && layer.getVisible() && (layer.getSource() instanceof OlImageWmsSource || layer.getSource() instanceof OlTileWmsSource)) {
      const wmsSource: any = layer.getSource();
      const encodedLayerNames = wmsSource.getParams().LAYERS;
      loading = loadingQueue!.find((e: string) => e.indexOf(encodedLayerNames) > -1);
    }
    const loadingSpanClass = `fa fa-spinner fa-spin layer-tree-node-loading-${loading ? 'active' : 'inactive'}`;

    return (
      <span
        className="layer-tree-node-title"
      >
        <Tooltip
          title={t('LayerTreePanel.toggleVisibilityTooltipText')}
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
              overlay={<div>Layer settings</div>}
              placement="topLeft"
              trigger={['click']}
            >
              <Tooltip
                title={this.props.t('LayerTreePanel.layerSettingsTooltipText')}
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
      </span>
    );
  }

  /**
   * TODO
   */
  treeNodeFilter() {
    return true;
  }

  /**
   *
   */
  getLegendItems() {
    const { map } = this.props;
    const layers = map.getLayerGroup().getLayers().getArray();
    const scale = map.getView().getResolution(); // TODO:_ fix me!

    // clone the array, reverse will work in place
    const reversed = layers.slice(0).reverse().filter((l: OlLayer) => l.getVisible());
    const legends = reversed.map((l: OlLayer) => {
      return <Collapse
        bordered={false}
        destroyInactivePanel
      >
        <Panel
          key="1" // TODO: !
          header={l.get('name')}
        >
          <Legend
            key={l.getRevision()}
            layer={l}
            extraParams={{
              scale: scale,
              WIDTH: 30 * 1.5,
              HEIGHT: 30,
              TRANSPARENT: true,
              LEGEND_OPTIONS: 'fontAntiAliasing:true;forceLabels:on;fontName:DejaVu Sans Condensed'
            }}
          />
        </Panel>
      </Collapse>;
    });

    return (
      <div>
        {legends}
      </div>
    );
  }

  /**
   *
   * @param layers
   */
  getLayerVisiblilityClassName(layers: OlLayer[]) {
    if (!layers) {
      return 'fa fa-eye-slash all-layers-handle';
    }
    const filteredLayers = layers.filter(this.treeNodeFilter);
    if (!filteredLayers) {
      return 'fa fa-eye-slash all-layers-handle';
    }
    const numLayers = filteredLayers.length;
    let visibleLayers = 0;
    filteredLayers.forEach(l => {
      if (l.getVisible() === true) {
        visibleLayers++;
      }
    });
    if (visibleLayers === 0) {
      return 'fa fa-eye-slash all-layers-handle';
    }

    return visibleLayers === numLayers ? 'fa fa-eye all-layers-handle' : 'fa fa-eye some-layers all-layers-handle';
  }

  /**
   *
   */
  onAllLayersVisibleChange(mapLayers: OlLayer[]) {
    const filteredLayers = mapLayers.filter(this.treeNodeFilter);
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
    this.forceUpdate();
  }

  /**
   *
   * @param layer
   */
  onLayerTreeNodeVisibilityChange(layer: OlLayer) {
    const nextLayerVisibility = !layer.getVisible();
    layer.setVisible(nextLayerVisibility);
    this.forceUpdate();
  }

  /**
   *
   * @param activeKeys
   */
  onAccordionChange(activeKeys: string[]) {
    this.setState({ activeKeys });
  }

  /**
   * The render function
   */
  render() {
    const {
      map
    } = this.props;

    const {
      activeKeys,
      isCollapsed
    } = this.state;

    const mapLayers = this.props.map.getLayers().getArray();
    const layerVisibilityClassName = this.getLayerVisiblilityClassName(mapLayers);

    return (
        isCollapsed ? <SimpleButton
          icon="list"
          shape="circle"
          tooltip={'t(Header.helpButtonTooltip'} // TODO: i18n
          onClick={() => this.setState({ isCollapsed: false })}
          tooltipPlacement={'bottom'}
          className="collapse-icon"
        /> :
        <div>
          <div
            onClick={() => this.setState({ isCollapsed: true })}
            className="collapse-icon"
          >
          <Icon type="double-right" />
          </div>
        <Collapse
          className="layer-legend-accordion"
          bordered={false}
          activeKey={activeKeys}
          destroyInactivePanel
          onChange={this.onAccordionChange}
          >
          <Panel
            header={
              <Titlebar className="layer-legend-accordion-title">
                <span>Themenauswahl</span> // TODO: i18n
              </Titlebar>
            } // TODO: i18n
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
              &nbsp;Alle Layer aktivieren! // TODO: i18n + font
            </span>
            <LayerTree
              map={map}
              layerGroup={map.getLayerGroup()}
              nodeTitleRenderer={this.treeNodeTitleRenderer}
              filterFunction={this.treeNodeFilter}
              />
          </Panel>
          <Panel
            header={
              <Titlebar className="layer-legend-accordion-title">
                <span>Legende</span> // TODO: i18n
              </Titlebar>
            }
            key="legend"
            className="legend-collapse-panel"
            >
            {this.getLegendItems()}
          </Panel>
        </Collapse>
      </div>
    );
  }
}
