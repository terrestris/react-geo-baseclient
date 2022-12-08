import * as React from 'react';

import OlLayerGroup from 'ol/layer/Group';
import OlLayerBase from 'ol/layer/Base';
import OlImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import TileWMS from 'ol/source/TileWMS';
import { getUid } from 'ol/util';

import { MapUtil } from '@terrestris/ol-util/dist/MapUtil/MapUtil';

import Legend from '../../Legend/Legend';

// default props
interface DefaultLegendContainerProps {
  layers: [];
}
interface LegendContainerProps extends Partial<DefaultLegendContainerProps>{
  layerGroup: OlLayerGroup;
  filterFn?: (l: OlLayerBase) => {};
  t?: () => {};
  scale?: number;
}

interface LegendContainerState {
  renderLegendToggle: boolean;
}

/**
 * Class representing the LegendContainer.
 *
 * @class LegendContainer
 * @extends React.Component
 */
export default class LegendContainer extends React.Component<LegendContainerProps, LegendContainerState> {

  /**
   * Create the LegendContainer.
   *
   * @constructs LegendContainer
   */
  constructor(props: LegendContainerProps) {
    super(props);
    this.state = {
      renderLegendToggle: false
    };
    this.props.layerGroup.on('change', this.collectLayers.bind(this));
  }

  /**
   *
   */
  collectLayers() {
    // this is a dummy to trigger the render method when the
    // state of a layer has changed
    this.setState({
      renderLegendToggle: !this.state.renderLegendToggle
    });
  }

  /**
   * The render function
   */
  render() {
    const {
      layerGroup,
      filterFn,
      scale
    } = this.props;
    let layers: OlImageLayer<ImageWMS>[] = MapUtil.getAllLayers(layerGroup) as OlImageLayer<ImageWMS>[];

    layers = layers
      .filter((layer: OlImageLayer<ImageWMS>) =>
        (layer.getSource && layer.getSource() instanceof TileWMS) ||
        layer.getSource && layer.getSource() instanceof ImageWMS)
      .filter(filterFn);

    // clone the array, reverse will work in place
    const reversed = layers.slice(0).reverse();

    const legends = reversed.map((l) =>
      (
        <Legend
          key={getUid(l)}
          layer={l}
          scale={scale}
          collapsed={false}
        />
      )
    );

    return (
      <div>
        {legends}
      </div>
    );
  }
}
