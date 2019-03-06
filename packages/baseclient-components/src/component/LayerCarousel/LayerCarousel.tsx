import * as React from 'react';
import './LayerCarousel.less';
import OlSourceTileWMS from 'ol/source/TileWMS';
import OlSourceImageWMS from 'ol/source/ImageWMS';

import {
  Carousel
} from 'antd';

interface LayerCarouselProps {
  layers: any,
  map: any
}

interface LayerCarouselState {
  mouseDownTime: number,
  renderTrigger: number
}

/**
 * Class representing the LayerCarousel.
 * Layers can have an `imageUrl` property which will be used
 * when specified. If not, a GetMap is issued for preview purposes
 *
 * @class LayerCarousel
 * @extends React.Component
 */
export default class LayerCarousel extends React.Component<LayerCarouselProps, LayerCarouselState> {

  /**
   * Create the LayerCarousel.
   *
   * @constructs LayerCarousel
   */
  constructor(props: LayerCarouselProps) {
    super(props);
    this.state = {
      mouseDownTime: 0,
      renderTrigger: 0
    };
    this.props.map.on('moveend', () => {
      this.setState({
        renderTrigger: this.state.renderTrigger + 1
      });
    });
  }

  /**
   *
   * @param layer
   */
  getLayerPreview(layer: any) {
    if (!(layer.getSource() instanceof OlSourceTileWMS) &&
        !(layer.getSource() instanceof OlSourceImageWMS)) {
      return '404';
    }
    const {
      map
    } = this.props;
    const extent = map.getView().calculateExtent();
    let baseUrl;
    if (layer.getSource().getUrls) {
      baseUrl = layer.getSource().getUrls()[0];
    } else {
      baseUrl = layer.getSource().getUrl();
    }
    const baseParams =
      '?SERVICE=WMS&' +
      'VERSION=1.1.0&' +
      'REQUEST=GetMap&' +
      'FORMAT=image/png&' +
      'TRANSPARENT=true&' +
      'LAYERS=' + layer.getSource().getParams().LAYERS + '&' +
      'WIDTH=' + this.getWidth() + '&' +
      'HEIGHT=128&' +
      'SRS=EPSG:3857&' +
      'STYLES=&' +
      'BBOX=' + extent.join(',');
    return baseUrl + baseParams;
  }

  /**
   * Get the width for GetMap requests
   */
  getWidth() {
    const {
      map
    } = this.props;
    const size = map.getSize();
    if (!size) {
      return 128;
    }
    const ratio = size[0] / size[1];
    return Math.round(128 * ratio);
  }

  /**
   *
   * @param evt
   */
  onSlideClick(layer: any) {
    const {
      map
    } = this.props;

    // TODO: slow clicks will be handled as drags....
    if (this.state.mouseDownTime > 180) {
      return;
    }

    map.getLayers().getArray().forEach((l: any) => l.set('visible', false));
    layer.set('visible', true);
    this.setState({
      renderTrigger: this.state.renderTrigger + 1
    });
  }

  /**
   * `onMouseDown` handler for carousel. Will be used to init a mouseDownTime
   * state value to determine between drag and click events on carousel items
   * (s. #onSlideClick method).
   */
  mouseDown() {
    this.setState({
      mouseDownTime: new Date().getTime()
    });
  }

  /**
   * `onMouseUp` handler for carousel. Will be used to compute a final value of
   * mouseDownTime state value to determine between drag and click events on
   * carousel items (s. #onSlideClick method).
   */
  mouseUp() {
    this.setState({
      mouseDownTime: new Date().getTime() - this.state.mouseDownTime
    });
  }

  /**
   * The render function
   */
  render() {
    const {
      layers
    } = this.props;

    const carouselSettings = {
      className: 'carousel',
      slidesToShow: Math.round(window.innerWidth / this.getWidth() - 1),
      slidesToScroll: 1,
      swipeToSlide: true,
      centerMode: true,
      infinite: true,
      dots: false,
      draggable: true,
      arrows: true,
      responsive: [
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3
          }
        },
        {
          breakpoint: 1366,
          settings: {
            slidesToShow: 4
          }
        },
        {
          breakpoint: 1920,
          settings: {
            slidesToShow: 5
          }
        }
      ]
    };

    const layerSlides = layers.map((layer: any) =>
      <div
        key={Math.random()}
        className={layer.get('visible') ? 'carousel-slide selected' : 'carousel-slide'}
        style={{width: this.getWidth() + 'px'}}
        onClick={this.onSlideClick.bind(this, layer)}
        onMouseDown={this.mouseDown.bind(this)}
        onMouseUp={this.mouseUp.bind(this)}
      >
        {layer.get('name')}
        <br/>
        <img
          src={layer.get('imageUrl') ? layer.get('imageUrl') : this.getLayerPreview(layer)}
          height={128}
        />
      </div>
    );

    return (
      <div className='carousel-wrapper'>
        <Carousel {...carouselSettings}>
          {layerSlides}
        </Carousel>
      </div>
    );
  }
}
