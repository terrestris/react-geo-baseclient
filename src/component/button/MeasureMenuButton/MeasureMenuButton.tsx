import * as React from 'react';

import MeasureButton from '@terrestris/react-geo/dist/Button/MeasureButton/MeasureButton';
import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';
import Toolbar from '@terrestris/react-geo/dist/Toolbar/Toolbar';
import ToggleGroup from '@terrestris/react-geo/dist/Button/ToggleGroup/ToggleGroup';

import { Menu } from 'antd';

import './MeasureMenuButton.less';

interface DefaultMeasureMenuButtonProps {
  type: string,
  shape: string,
  menuPlacement: any
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
  activeTool: string,
  activeToolIcon: string
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
    menuPlacement: 'bottomRight'
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
      activeTool: null,
      activeToolIcon: 'print' // TODO
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
    // TODO set meaningful icons
    switch (measureType) {
      case 'line':
        return 'print';
      case 'polygon':
        return 'info';
      case 'angle':
        return 'globe';
      default:
        break;
    }
  }

  /**
   *
   */
  getMenuItems() {
    const {
      measureTypes,
      map,
      type,
      shape
    } = this.props;

    return (
      <Menu>
        {
          measureTypes.map((mt: string) => {
            const icon = this.getButtonIcon(mt);
            return <Menu.Item key={mt}>
              <MeasureButton
                type={type}
                shape={shape}
                icon={icon}
                map={map}
                measureType={mt}
              />
            </Menu.Item>
          })
        }
      </Menu>
    );
  }

  /**
   *
   */
  onMenuButtonClick() {
    this.setState({
      showToolbar: !this.state.showToolbar
    });
  }

  /**
   *
   */
  onToggledToolChange(button: any) {
    const pressed = !button.pressed;
      this.setState({
        activeTool: pressed ? button.name : null,
        activeToolIcon: pressed ? button.icon : 'print' // TODO adapt icons
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
      shape
    } = this.props;

    const {
      activeTool
    } = this.state;

    return (
      <ToggleGroup
        orientation="horizontal"
        selectedName={activeTool}
        onChange={this.onToggledToolChange}
      >
        {
          measureTypes.map((mt: string) => {
            const icon = this.getButtonIcon(mt);
            return <MeasureButton
              key={mt}
              name={mt}
              type={type}
              shape={shape}
              icon={icon}
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
      shape
    } = this.props;

    const {
      showToolbar,
      activeToolIcon
    } = this.state;

    return (
      <div
        className="measure-tools-wrapper"
      >
        <SimpleButton
          type={type}
          shape={shape}
          icon={activeToolIcon}
          onClick={this.onMenuButtonClick}
        />
        {
          showToolbar &&
          <Toolbar
            className="measure-tb"
          >
            {this.getToolbarItems()}
          </Toolbar>
        }
      </div>
    );
  }
}
