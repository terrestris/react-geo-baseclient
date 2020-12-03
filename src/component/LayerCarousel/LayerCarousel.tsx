import * as React from 'react';
import OlLayerGroup from 'ol/layer/Group';
import OlLayer from 'ol/layer/Base';
import Carousel from '@brainhubeu/react-carousel';
import '@brainhubeu/react-carousel/lib/style.css';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import LayerCarouselSlide from '../LayerCarouselSlide/LayerCarouselSlide';

interface DefaultLayerCarouselProps {
  map: any;
  className: string;
}

interface LayerCarouselProps extends Partial<DefaultLayerCarouselProps> {
  layers: any[];
  onLayerSelected: (olUid: string) => void;
}

interface LayerCarouselState {
  mouseDownTime: number;
  renderTrigger: number;
  originalBaseLayerOlUid: string;
  width: number;
  ratio: number;
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

  public static defaultProps: LayerCarouselProps = {
    onLayerSelected: () => { },
    layers: [],
    className: ''
  };

  /**
   * Create the LayerCarousel.
   *
   * @constructs LayerCarousel
   */
  constructor(props: LayerCarouselProps) {
    super(props);
    this.state = {
      mouseDownTime: 0,
      renderTrigger: 0,
      originalBaseLayerOlUid: '',
      ratio: 1,
      width: 128
    };

    // binds
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.onCarouselItemClick = this.onCarouselItemClick.bind(this);
    this.onCarouselItemHover = this.onCarouselItemHover.bind(this);
    this.onCarouselItemHoverOut = this.onCarouselItemHoverOut.bind(this);
    this.renderTrigger = this.renderTrigger.bind(this);
  }

  /**
   * @memberof LayerCarousel
   */
  componentDidMount() {
    this.props.map.on('moveend', this.renderTrigger);
    this.setState({
      ratio: this.getRatio(),
      width: this.getWidth()
    });
    this.renderTrigger();
  }

  /**
   *
   *
   * @memberof LayerCarousel
   */
  componentWillUnmount() {
    this.props.map.un('moveend', this.renderTrigger);
  }

  /**
   *
   */
  shouldComponentUpdate(nextProps: LayerCarouselProps, nextState: LayerCarouselState) {
    if (this.state.renderTrigger < nextState.renderTrigger) {
      return true;
    }
    return false;
  }

  /**
   *
   *
   * @memberof LayerCarousel
   */
  renderTrigger() {
    this.setState({
      renderTrigger: this.state.renderTrigger + 1
    });
  }

  /**
   *
   * @param evt
   */
  onSlideClick(layer: any) {
    const {
      map
    } = this.props;

    if (this.state.mouseDownTime > 180) {
      return;
    }

    map.getLayers().getArray().forEach((l: any) => l.set('visible', false));
    layer.set('visible', true);
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
   * Sets layers from the hovered layerset on the map temporary.
   *
   * @param {Object} evt Event object containing currently hovered layerset.
   */
  onCarouselItemHover(evt: any, callback?: Function) {
    const layer = this.findLayer(evt);
    if (!layer) {
      return;
    }
    const currentlyVisibleLayer = this.props.layers.find(l => l.getVisible());
    this.setState({
      originalBaseLayerOlUid: currentlyVisibleLayer ? currentlyVisibleLayer.ol_uid : undefined
    });
    // change visibility
    this.setLayersVisible([layer.ol_uid]);
    if (callback) {
      callback(layer.ol_uid);
    }
  }

  /**
   * Restores previously stored in state original map layers on carousel item
   * hover out event.
   */
  onCarouselItemHoverOut() {
    const {
      originalBaseLayerOlUid
    } = this.state;

    this.setLayersVisible([originalBaseLayerOlUid]);
    this.setState({
      originalBaseLayerOlUid: undefined
    });
  }

  /**
   *
   *
   * @param {String[]} olUidsToSetVisible
   * @memberof LayerCarousel
   */
  setLayersVisible(olUidsToSetVisible: string[]) {
    const {
      layers
    } = this.props;

    layers.forEach((l: any) => {
      const visibility = olUidsToSetVisible.includes(l.ol_uid);
      l.setVisible(visibility);
      if (l instanceof OlLayerGroup) {
        l.getLayers().forEach((ll: OlLayer) => ll.setVisible(visibility));
      }
    });
  }

  /**
   * Sets clicked layerset as currentLayerSet in state and collapses the
   * carousel.
   *
   * @param {Object} evt Event object containing currently clicked layerset.
   */
  onCarouselItemClick(evt: React.MouseEvent) {
    if (this.state.mouseDownTime > 180) {
      return;
    }

    const {
      onLayerSelected
    } = this.props;
    this.onCarouselItemHover(evt, onLayerSelected);
  }

  /**
   * findLayer - Find a clicked/hovered layer.
   *
   * @param {Object} evt The mouseover/click event
   * @return {OlLayer} layer The clicked/hovered layer object
   */
  findLayer(evt: any) {
    const targetElement = evt.target;

    const id = targetElement.getAttribute('data-identifier');
    if (!id) {
      return;
    }

    const {
      layers
    } = this.props;

    return layers.find((l: any) => l.ol_uid === id);
  }

  getRatio() {
    const {
      map
    } = this.props;
    const size = map.getSize();
    if (!size) {
      return 1;
    }
    const ratio = size[0] / size[1];
    return ratio;
  }

  /**
   * Get the width for GetMap requests
   */
  getWidth() {
    // TODO: maybe configurable ??
    return 128 * this.getRatio();
  }

  getLayerSlides() {
    const {
      map
    } = this.props;

    const {
      width,
      ratio
    } = this.state;

    const extent = map.getView().calculateExtent();
    const mapProjection = map.getView().getProjection().getCode();
    return this.props.layers.map((layer: any) => {
      const staticImageUrl = layer.get('staticImageUrl');
      const previewImageRequestUrl = layer.get('previewImageRequestUrl');
      let layerFt, requestUrl;
      if (!staticImageUrl) {
        if (layer.get('type') === 'WMTS' && previewImageRequestUrl) {
          requestUrl = previewImageRequestUrl;
          layerFt = layer.getSource().getLayer();
        } else {
          const source = layer.getSource();
          const params = source.getParams();
          const layersKey = Object.keys(params).find(p => p.toLowerCase() === 'layers');
          layerFt = source.getParams()[layersKey];
          if (source.getUrls) {
            requestUrl = source.getUrls()[0];
          } else {
            requestUrl = source.getSource().getUrl();
          }
        }
      }
      const layerName = layer.get('name');
      const isVisible = layer.getVisible();
      const olUid = layer.ol_uid;
      return <LayerCarouselSlide
        onClick={this.onCarouselItemClick}
        onMouseEnter={this.onCarouselItemHover}
        onMouseLeave={this.onCarouselItemHoverOut}
        onMouseDown={this.mouseDown}
        onMouseUp={this.mouseUp}
        layerName={layerName}
        extent={extent}
        width={width}
        ratio={ratio}
        projection={mapProjection}
        staticImageUrl={staticImageUrl}
        layerFt={layerFt}
        requestUrl={requestUrl}
        isSelected={isVisible}
        layerOlUid={olUid}
        key={olUid}
      />;
    });
  }

  /**
   * The render function
   */
  render() {
    const carouselClassName = `${this.props.className} carousel-wrapper`.trim();
    const layerSlides: any[] = this.getLayerSlides();

    return (
      <Carousel
        className={carouselClassName}
        arrows={true}
        infinite={true}
        centered={true}
        slidesPerPage={Math.round(window.innerWidth / this.getWidth()) - 1}
        arrowLeft={<LeftOutlined />}
        arrowRight={<RightOutlined />}
        addArrowClickHandler={true}
      >
        {layerSlides}
      </Carousel>
    );
  }
}
