import React from 'react';

import OlLayerBase from 'ol/layer/Base';

import {
  Menu,
  Dropdown,
  Tooltip,
  Modal
} from 'antd';
const MenuItem = Menu.Item;

const _isEmpty = require('lodash/isEmpty');

interface LayerTreeDropdownContextMenuProps {
  layer: OlLayerBase;
  t: (arg: string) => {};
  map: any;
}

interface LayerTreeDropdownContextMenuState {
  infoModalVisible: boolean;
  menuHidden: boolean;
}

/**
 * Class LayerTreeDropdownContextMenu.
 *
 * @class LayerTreeDropdownContextMenu
 * @extends React.Component
 */
export class LayerTreeDropdownContextMenu extends React.Component<LayerTreeDropdownContextMenuProps, LayerTreeDropdownContextMenuState> {

  /**
   * Creates the LayerTreeDropdownContextMenu.
   *
   * @constructs LayerTreeDropdownContextMenu
   */
  constructor(props: LayerTreeDropdownContextMenuProps) {
    super(props);

    // binds
    this.onContextMenuItemClick = this.onContextMenuItemClick.bind(this);
    this.changeInfoModalVisibility = this.changeInfoModalVisibility.bind(this);
    this.onDropdownMenuVisibleChange = this.onDropdownMenuVisibleChange.bind(this);

    this.state = {
      infoModalVisible: false,
      menuHidden: true
    };
  }

  /**
   * Called if the an item of the layer context/settings menu has been clicked.
   *
   * @param {Object} evt The click event.
   */
  onContextMenuItemClick(evt: any) {
    const key = evt.key;
    switch(key) {
      case 'info':
        this.changeInfoModalVisibility();
        break;
      default:
        break;
    }
  }

  /**
   * Handles visibility of the dropdown menu
   *
   */
  onDropdownMenuVisibleChange(visible: boolean) {
    this.setState({
      menuHidden: !visible
    });
  }

  /**
   * Opens the info modal window for the current layer.
   */
  changeInfoModalVisibility() {
    this.setState({
      infoModalVisible: !this.state.infoModalVisible,
      menuHidden: true
    });
  }


  /**
   * The render function.
   */
  render () {
    const {
      t,
      layer
    } = this.props;

    const {
      infoModalVisible,
      menuHidden
    } = this.state;

    const settingsMenu = (
      <Menu
        selectable={false}
        onClick={this.onContextMenuItemClick}
      >
        <MenuItem
          disabled={_isEmpty(layer.get('description'))}
          key="info"
        >
          {t('LayerTreeDropdownContextMenu.layerInfoText')}
        </MenuItem>
      </Menu>
    );

    return (
      <div>
        <Modal
          className="info-modal"
          visible={infoModalVisible}
          footer={null}
          title={layer.get('name') || t('Modal.LayerDescription.title')}
          onCancel={() => this.changeInfoModalVisibility()}
        >
          <div>{layer.get('description')}</div>
        </Modal>
        <Dropdown
          overlay={settingsMenu}
          placement="bottomLeft"
          onVisibleChange={this.onDropdownMenuVisibleChange}
          visible={!menuHidden}
          trigger={['click']}
        >
          <Tooltip
            title={this.props.t('LayerTreeDropdownContextMenu.layerSettingsTooltipText')}
            placement="right"
            mouseEnterDelay={0.5}
          >
            <span
              className="fa fa-cog layer-tree-node-title-settings"
            />
          </Tooltip>
        </Dropdown>
      </div>
    );
  }
}

export default LayerTreeDropdownContextMenu;
