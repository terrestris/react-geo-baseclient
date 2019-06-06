import * as React from 'react';
import {
  Tooltip,
  Dropdown
} from 'antd';

import OlLayerGroup from 'ol/layer/Group';
import OlTileWmsSource from 'ol/source/TileWMS';
import OlImageWmsSource from 'ol/source/Image';

import {
  LayerTransparencySlider
} from '@terrestris/react-geo';

import './LayerLegendAccordionTreeNode.less';

// default props
interface DefaultLayerLegendAccordionNodeProps {
  layer: any
}

interface LayerLegendAccordionNodeProps extends Partial<DefaultLayerLegendAccordionNodeProps>{
  t: (arg: string) => {};
}

interface LayerLegendAccordionNodeState {
  loadingQueue: String[]
}

/**
 * Class representing the LayerLegendAccordionNode.
 *
 * @class LayerLegendAccordionNode
 * @extends React.Component
 */
export default class LayerLegendAccordionNode extends React.Component<LayerLegendAccordionNodeProps, LayerLegendAccordionNodeState> {

  public static defaultProps: DefaultLayerLegendAccordionNodeProps = {
    layer: null
  };

  constructor(props: LayerLegendAccordionNodeProps) {
    super(props);

    this.state = {
      loadingQueue: []
    };

    // binds
    this.loadingStartHandler = this.loadingStartHandler.bind(this);
    this.loadingEndHandler = this.loadingEndHandler.bind(this);
    this.onLayerTreeNodeVisibilityChange = this.onLayerTreeNodeVisibilityChange.bind(this);
    this.registerLoadingEventsForOlLayer = this.registerLoadingEventsForOlLayer.bind(this);
  }

  /**
   * The componentWillMount lifecycle function
   *
   * @memberof LayerLegendAccordionNode
   */
  componentWillMount() {
    const { layer } = this.props;
    if (layer) {
      this.registerLoadingEventsForOlLayer(layer, true);
    }
  }

  /**
   * The componentWillUnmount lifecycle function
   *
   * @memberof LayerLegendAccordionNode
   */
  componentWillUnmount() {
    const { layer } = this.props;
    if (layer) {
      this.registerLoadingEventsForOlLayer(layer, false);
    }
  }

  /**
   * Register loadstart and loadend handler for ImageWMS and TileWMS layers
   * @param {OlLayer} layer The OpenLayers layer to register listener for
   * @param {boolean} mode The mode: true => register handler, false => unregister handler
   */
  registerLoadingEventsForOlLayer(layer: any, mode: boolean) {
    if (!layer.getSource) {
      return;
    }
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
   *
   *
   * @returns
   * @memberof LayerLegendAccordionNode
   */
  render() {
    const {
      layer,
      t
    } = this.props;

    const {
      loadingQueue
    } = this.state;

    if (!layer) {
      return <div />;
    }

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

    const loadingSpanClass = `fa fa-spinner fa-spin layer-tree-node-loading-${loadingQueue.length > 0 ? 'active' : 'inactive'}`;

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
    )
  }

}
