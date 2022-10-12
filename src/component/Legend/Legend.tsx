import * as React from 'react';

import OlLayerBase from 'ol/layer/Base';

import RGLegend from '@terrestris/react-geo/dist/Legend/Legend';
import ToggleButton from '@terrestris/react-geo/dist/Button/ToggleButton/ToggleButton';
import Titlebar from '@terrestris/react-geo/dist/Panel/Titlebar/Titlebar';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronCircleDown, faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';

// default props
interface DefaultLegendProps {
  collapsed: boolean;
}
interface LegendProps extends Partial<DefaultLegendProps>{
  layer: OlLayerBase;
  collapsed: boolean;
  scale?: number;
}

interface LegendState {
  collapsed: boolean;
}

export type LegendParams = {
  WIDTH: number;
  HEIGHT: number;
  TRANSPARENT: boolean;
  LEGEND_OPTIONS: string;
  SCALE?: number;
};

/**
 * Class representing the Legend.
 *
 * @class Legend
 * @extends React.Component
 */
export default class Legend extends React.Component<LegendProps, LegendState> {

  /**
   * Create the Legend.
   *
   * @constructs Legend
   */
  constructor(props: LegendProps) {
    super(props);
    this.onToggleCollapse = this.onToggleCollapse.bind(this);
    this.state = {
      collapsed: props.collapsed
    };
  }

  /**
   * Called on toggle of the collapse button.
   *
   * @param {Boolean} pressed If the toggle button is pressed.
   */
  onToggleCollapse(pressed: boolean) {
    this.setState({
      collapsed: pressed
    });
  }

  /**
   * The render function
   */
  render() {
    const {
      layer,
      scale
    } = this.props;

    const extraClassName = this.state.collapsed ? 'collapsed' : '';
    const collapseTool = <ToggleButton
      icon={
        <FontAwesomeIcon
          icon={faChevronCircleUp}
        />
      }
      pressedIcon={
        <FontAwesomeIcon
          icon={faChevronCircleDown}
        />
      }
      // TODO Don't access private property ol_uid
      // @ts-ignore
      key={layer.ol_uid}
      onToggle={this.onToggleCollapse}
      pressed={this.state.collapsed}
      size="small"
    />;

    /**
     *
     */
    const getLegend = () => {
      const params: LegendParams = {
        WIDTH: 30 * 1.5,
        HEIGHT: 30,
        TRANSPARENT: true,
        LEGEND_OPTIONS: 'fontAntiAliasing:true;forceLabels:on;fontName:DejaVu Sans Condensed'
      };
      if (scale) {
        params.SCALE = scale;
      }
      return (
        <RGLegend
          className={`${extraClassName}`}
          layer={layer}
          extraParams={params}
        />
      );
    };

    return (
      // TODO Don't access private property ol_uid
      // @ts-ignore
      <div key={layer.ol_uid}>
        <Titlebar
          tools={[collapseTool]}
        >
          {layer.get('name')}
        </Titlebar>
        {this.state.collapsed ? null : getLegend()}
      </div>
    );
  }
}
