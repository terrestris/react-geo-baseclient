import * as React from 'react';

import OlOverviewMap from 'ol/control/OverviewMap';

import {
  ToggleButton,
  SimpleButton
} from '@terrestris/react-geo';

import { isFunction } from 'lodash';

import './LayerSetBaseMapChooser.less';
import LayerCarousel from '../../component/LayerCarousel/LayerCarousel';

// default props
interface DefaultLayerSetBaseMapChooserProps {
  loading: boolean;
  onCollapse: (pressed: boolean) => void;
}

interface LayerSetBaseMapChooserProps extends Partial<DefaultLayerSetBaseMapChooserProps> {
  map: any;
  t: (arg: string) => {};
  baseLayerGroup: any;
  topicLayerGroup: any;
  onTopicLayerGroupSelected: (arg: string) => void;
}

interface LayerSetBaseMapChooserState {
  showBaseLayerCarousel: boolean;
  showTopicCarousel: boolean;
}

/**
 *
 */
class LayerSetBaseMapChooser extends React.Component<LayerSetBaseMapChooserProps, LayerSetBaseMapChooserState> {

  /**
   * The default props of LayerSetBaseMapChooser
   *
   * @static
   * @type {DefaultLayerSetBaseMapChooserProps}
   * @memberof LayerSetBaseMapChooser
   */
  public static defaultProps: DefaultLayerSetBaseMapChooserProps = {
    loading: false,
    onCollapse: () => { }
  };

  /**
   * Creates an instance of LayerSetBaseMapChooser.
   * @param {LayerSetBaseMapChooserProps} props
   * @memberof LayerSetBaseMapChooser
   */
  constructor(props: LayerSetBaseMapChooserProps) {
    super(props);

    this.state = {
      showTopicCarousel: false,
      showBaseLayerCarousel: false
    }

    // binds
    this.onShowTopicCarouselToggle = this.onShowTopicCarouselToggle.bind(this);
    this.onShowBaseLayerCarouselToggle = this.onShowBaseLayerCarouselToggle.bind(this);
    this.onCollapseClick = this.onCollapseClick.bind(this);
    this.onTopicLayerGroupSelected = this.onTopicLayerGroupSelected.bind(this);
    this.onBaseLayerSelected = this.onBaseLayerSelected.bind(this);
  }

  /**
   * After the compoment did mount, add the overviewmap to generated div
   *
   * @memberof LayerSetBaseMapChooser
   */
  componentDidMount() {
    const {
      map
    } = this.props;

    const overviewMap = new OlOverviewMap({
      className: 'ol-overviewmap layerset-basemap-chooser-overviewmap',
      collapsible: false,
      collapsed: false,
      target: document.getElementById('overview-map')
    });

    map.addControl(overviewMap);
  }

    /**
   *
   *
   * @param {boolean} pressed
   * @memberof SatAnalyseMain
   */
  onShowBaseLayerCarouselToggle(pressed: boolean) {
    this.setState({
      showBaseLayerCarousel: pressed
    });
  }

    /**
   *
   *
   * @param {boolean} pressed
   * @memberof SatAnalyseMain
   */
  onShowTopicCarouselToggle(pressed: boolean) {
    this.setState({
      showTopicCarousel: pressed
    });
  }

  /**
   *
   *
   * @memberof LayerSetBaseMapChooser
   */
  onCollapseClick() {
    this.props.onCollapse!(false);
  }

  /**
   *
   */
  onTopicLayerGroupSelected(layerOlUid: string) {
    this.setState({
      showTopicCarousel: false
    });
    const {
      map,
      onTopicLayerGroupSelected
    } = this.props;
    map.dispatchEvent('updateLayerAccordion');

    if (isFunction(onTopicLayerGroupSelected)) {
      onTopicLayerGroupSelected(layerOlUid);
    }
  }

  /**
   *
   */
  onBaseLayerSelected() {
    this.setState({
      showBaseLayerCarousel: false
    });
    const { map } = this.props;
    map.dispatchEvent('updateLayerAccordion');
  }

  /**
   *
   *
   * @returns
   * @memberof LayerSetBaseMapChooser
   */
  render() {
    const {
      baseLayerGroup,
      map,
      topicLayerGroup
    } = this.props;

    const {
      showTopicCarousel,
      showBaseLayerCarousel
    } = this.state;

    return (
      <div className="layerset-basemap-chooser">
       {
        showTopicCarousel ?
          <LayerCarousel
            className="topic-carousel"
            map={map}
            layers={topicLayerGroup.getLayers().getArray()}
            onLayerSelected={this.onTopicLayerGroupSelected}
          /> : null
        }
        {
          showBaseLayerCarousel ?
            <LayerCarousel
              className="base-layer-carousel"
              map={map}
              layers={baseLayerGroup.getLayers().getArray()}
              onLayerSelected={this.onBaseLayerSelected}
            /> : null
        }
        <div id="overview-map" />
        <SimpleButton
          size="small"
          className="collapse-btn"
          icon="compress"
          onClick={this.onCollapseClick}
        />
        <ToggleButton
          icon={showTopicCarousel ? 'angle-double-down' : 'angle-double-up'}
          size="small"
          className="show-topic-carousel-toggle"
          pressed={showTopicCarousel}
          onToggle={this.onShowTopicCarouselToggle}
        >
          Themen
        </ToggleButton>
        <ToggleButton
          size="small"
          className="show-baselayer-carousel-toggle"
          pressed={showBaseLayerCarousel}
          onToggle={this.onShowBaseLayerCarouselToggle}
        >
          <div>
            <span className={showBaseLayerCarousel ? 'fa fa-angle-double-up' : 'fa fa-angle-double-down'} />
            <span className="baselayer-carousel-toggle-text">Basiskarten</span>
          </div>
        </ToggleButton>
        </div>
    );
  }
}

export default LayerSetBaseMapChooser;
