import * as React from 'react';

import MeasureButton from '@terrestris/react-geo/dist/Button/MeasureButton/MeasureButton';
import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';
import Toolbar from '@terrestris/react-geo/dist/Toolbar/Toolbar';
import ToggleGroup from '@terrestris/react-geo/dist/Button/ToggleGroup/ToggleGroup';

import OlInteractionDraw from 'ol/interaction/Draw';

import MapUtil from '@terrestris/ol-util/dist/MapUtil/MapUtil';

import './MeasureMenuButton.less';

interface DefaultMeasureMenuButtonProps {
  type: string,
  shape: string,
  menuPlacement: 'left' | 'right'
}

interface MeasureMenuButtonProps extends Partial<DefaultMeasureMenuButtonProps> {
  map: any,
  tooltip: string,
  measureTypes: string [],
  key: string,
  t: (arg: string) => string
}

interface MeasureMenuButtonState {
  showToolbar: boolean,
  activeTool: string
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
    type: 'primary',
    shape: 'circle',
    menuPlacement: 'left',
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
    }

    this.getToolbarItems = this.getToolbarItems.bind(this);
    this.onToggledToolChange = this.onToggledToolChange.bind(this);
    this.onMenuButtonClick = this.onMenuButtonClick.bind(this);
  }

  /**
   *
   * @param measureType
   */
  getButtonIcon(measureType: string) {
    switch (measureType) {
      case 'line':
        return 'ft ft-measure-distance';
      case 'polygon':
        return 'ft ft-measure-area';
      case 'angle':
        return 'ft ft-redline-draw-line'; // TODO find a better icon
      default:
        break;
    }
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

    let orderedMeasureTypes = menuPlacement === 'left'? measureTypes : measureTypes.reverse();

    return (
      <ToggleGroup
        orientation="horizontal"
        selectedName={activeTool}
        onChange={this.onToggledToolChange}
      >
        {
          orderedMeasureTypes.map((mt: string) => {
            const fontIcon = this.getButtonIcon(mt);
            return <MeasureButton
              key={mt}
              name={mt}
              type={type}
              shape={shape}
              fontIcon={fontIcon}
              map={map}
              pressed={activeTool === mt}
              measureType={mt}
            />
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
          fontIcon="ft ft-toolgroup-measure"
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
