import * as React from 'react';

import { Spin } from 'antd';

import './LayerCarouselSlide.less';

// default props
export interface DefaultLayerCarouselSlideProps {
  width: number;
  ratio: number;
  layerName: string;
  isSelected: boolean;
  layerOlUid: string;
}

export interface LayerCarouselSlideProps extends Partial<DefaultLayerCarouselSlideProps> {
  onClick: (evt: React.MouseEvent) => void;
  onMouseEnter: (evt: React.MouseEvent) => void;
  onMouseLeave: () => void;
  staticImageUrl: string;
  layerFt: string,
  requestUrl: string;
  extent: number[];
  projection: string;
}

export interface LayerCarouselSlideState {
  isLoading: boolean;
}

/**
 * Class representing the layer carousel slider component.
 *
 * @class The Slide.
 * @extends React.Component
 */
export class LayerCarouselSlide extends React.Component<LayerCarouselSlideProps, LayerCarouselSlideState> {

  public static defaultProps: DefaultLayerCarouselSlideProps = {
    width: 128,
    ratio: 1,
    layerName: '',
    isSelected: false,
    layerOlUid: ''
  };

  /**
   * Creates an instance of Slide.
   * @param {SlideProps} props
   * @memberof Slide
   */
  constructor(props: LayerCarouselSlideProps) {
    super(props);

    this.state = {
      isLoading: true
    }

    // bindings
    this.onLoad = this.onLoad.bind(this);
  }

  /**
   * If static image is provided, no render needed after initialization
   */
  shouldComponentUpdate() {
    if (this.props.staticImageUrl) {
      return false;
    }
    return true;
  }

  /**
   * Construct URL used get layer preview
   */
  getLayerPreview(): string {
    const {
      extent,
      projection,
      width,
      ratio,
      staticImageUrl,
      requestUrl,
      layerFt
    } = this.props;

    if (!extent) {
      return;
    }

    if (staticImageUrl) {
      return staticImageUrl;
    }

    const height = width! / ratio!;

    const baseParams =
      '?SERVICE=WMS&' +
      'VERSION=1.1.1&' +
      'REQUEST=GetMap&' +
      'FORMAT=image/png&' +
      'TRANSPARENT=true&' +
      'LAYERS=' + layerFt + '&' +
      'HEIGHT='+ Math.round(height)+'&' +
      'WIDTH=' + Math.round(width!) + '&' +
      'SRS='+projection+'&' +
      'STYLES=&' +
      'BBOX=' + extent.join(',');
    return requestUrl + baseParams;
  }

  /**
   *
   */
  onLoad() {
    this.setState({
      isLoading: false
    })
  }

  /**
   * The render function.
   */
  render() {
    const {
      onClick,
      onMouseEnter,
      onMouseLeave,
      width,
      ratio,
      isSelected,
      layerName,
      staticImageUrl,
      layerOlUid
    } = this.props;

    const {
      isLoading
    } = this.state;

    const src: string = this.getLayerPreview();

    return (
      <div
        className={`layersetentry${isSelected ? ' selected' : ''}`}
        onMouseLeave={onMouseLeave}
        style={{
          width: `${width}px`,
          height: `${width!/ratio!}px`
        }}
      >
        {
          !staticImageUrl ?
            <Spin spinning={isLoading}>
              <div className="title-div">
                <b>{layerName}</b>
              </div>
            </Spin> : <div className="title-div">
                <b>{layerName}</b>
              </div>
        }
        <img
          data-identifier={layerOlUid}
          onClick={onClick}
          onLoad={this.onLoad}
          onMouseEnter={onMouseEnter}
          src={src}
          alt={layerName}
        />
      </div>
    );
  }
}
export default LayerCarouselSlide;
