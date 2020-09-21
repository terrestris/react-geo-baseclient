import * as React from 'react';

import MeasureButton, { MeasureButtonProps } from '@terrestris/react-geo/dist/Button/MeasureButton/MeasureButton';
import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';
import Toolbar from '@terrestris/react-geo/dist/Toolbar/Toolbar';
import ToggleGroup from '@terrestris/react-geo/dist/Button/ToggleGroup/ToggleGroup';

import OlInteractionDraw from 'ol/interaction/Draw';

import MapUtil from '@terrestris/ol-util/dist/MapUtil/MapUtil';

import './MeasureMenuButton.less';

interface DefaultMeasureMenuButtonProps extends MeasureButtonProps {
  menuPlacement: 'left' | 'right';
}

interface MeasureMenuButtonProps extends Partial<DefaultMeasureMenuButtonProps> {
  map: any;
  tooltip: string;
  measureTypes: string [];
  key: string;
  t: (arg: string) => string;
}

interface MeasureMenuButtonState {
  showToolbar: boolean;
  activeTool: string;
}

/**
 * Class representing the MeasureMenuButton.
 *
 * @class MeasureMenuButton
 * @extends React.Component
 */
export default class MeasureMenuButton extends React.Component<MeasureMenuButtonProps, MeasureMenuButtonState> {

  /**
  * The default properties.
  */
  public static defaultProps: DefaultMeasureMenuButtonProps = {
    map: null,
    type: 'primary',
    shape: 'circle',
    menuPlacement: 'left',
    measureType: 'line'
  };

  /**
   * Create the MeasureMenuButton.
   *
   * @constructs MeasureMenuButton
   */
  constructor(props: MeasureMenuButtonProps) {
    super(props);

    this.state = {
      showToolbar: false,
      activeTool: null
    };

    this.getToolbarItems = this.getToolbarItems.bind(this);
    this.onToggledToolChange = this.onToggledToolChange.bind(this);
    this.onMenuButtonClick = this.onMenuButtonClick.bind(this);
  }

  /**
   *
   */
  onMenuButtonClick() {
    const {
      map
    } = this.props;
    const drawInteractions = MapUtil.getInteractionsByClass(map, OlInteractionDraw);
    const measureLayer = MapUtil.getLayerByName(map, 'react-geo_measure');
    if (measureLayer) {
      measureLayer.getSource().clear();
    }
    drawInteractions.forEach((drawInteraction: OlInteractionDraw) => drawInteraction.setActive(false));
    this.setState({
      showToolbar: !this.state.showToolbar,
      activeTool: null
    });
  }

  /**
   *
   */
  onToggledToolChange(button: any) {
    const pressed = !button.pressed;
    this.setState({
      activeTool: pressed ? button.key : null
    });
  }

  /**
   *
   */
  getToolbarItems() {
    const {
      measureTypes,
      map,
      type,
      shape,
      menuPlacement
    } = this.props;

    const {
      activeTool
    } = this.state;

    const orderedMeasureTypes = menuPlacement === 'left'? measureTypes : measureTypes.reverse();

    return (
      <ToggleGroup
        orientation="horizontal"
        selectedName={activeTool}
        onChange={this.onToggledToolChange}
      >
        {
          orderedMeasureTypes.map((mt: 'line' | 'polygon' | 'angle') => {
            const iconName = mt === 'line'
              ? 'ft ft-measure-distance'
              : mt === 'polygon'
                ? 'ft ft-measure-area'
                : undefined;
            return <MeasureButton
              key={mt}
              name={mt}
              type={type}
              shape={shape}
              iconName={iconName}
              map={map}
              pressed={activeTool === mt}
              measureType={mt}
            >
              {mt === 'angle' ? '∢' : null}
            </MeasureButton>;
          })
        }
      </ToggleGroup>
    );
  }

  /**
   * The render function
   */
  render() {
    const {
      type,
      menuPlacement,
      shape
    } = this.props;

    const {
      showToolbar
    } = this.state;

    return (
      <div
        className="measure-tools-wrapper"
      >
        <SimpleButton
          type={type}
          shape={shape}
          iconName="ft ft-toolgroup-measure"
          onClick={this.onMenuButtonClick}
        />
        {
          showToolbar &&
          <Toolbar
            className={`measure-tb ${menuPlacement}`}
          >
            {this.getToolbarItems()}
          </Toolbar>
        }
      </div>
    );
  }
}
