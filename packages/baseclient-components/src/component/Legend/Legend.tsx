import * as React from 'react';

import {
  Legend as RGLegend,
  ToggleButton,
  Titlebar
} from '@terrestris/react-geo';

// default props
interface DefaultLegendProps {
  collapsed: boolean
}
interface LegendProps extends Partial<DefaultLegendProps>{
  layer: any,
  collapsed: boolean,
  scale?: number
}

interface LegendState {
  collapsed: boolean
}

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
      icon="chevron-circle-up"
      pressedIcon="chevron-circle-down"
      key={layer.ol_uid}
      onToggle={this.onToggleCollapse}
      pressed={this.state.collapsed}
      size="small"
    />;

    /**
     *
     */
    const getLegend = () => {
      let params = {
        WIDTH: 30 * 1.5,
        HEIGHT: 30,
        TRANSPARENT: true,
        LEGEND_OPTIONS: 'fontAntiAliasing:true;forceLabels:on;fontName:DejaVu Sans Condensed'
      };
      if (scale) {
        params["SCALE"] = scale;
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
