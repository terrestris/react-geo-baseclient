import React from 'react';

import OlLayerBase from 'ol/layer/Base';

import Metadata from '../../Modal/Metadata/Metadata';

import {
  Menu,
  Dropdown,
  Modal
} from 'antd';
const MenuItem = Menu.Item;

import _isEmpty from 'lodash/isEmpty';

interface LayerTreeDropdownContextMenuProps {
  layer: OlLayerBase;
  t: (arg: string) => {};
  map: any;
}

interface LayerTreeDropdownContextMenuState {
  infoModalVisible: boolean;
  menuHidden: boolean;
  metaDataModalVisible: boolean;
}

/**
 * Class LayerTreeDropdownContextMenu.
 *
 * @class LayerTreeDropdownContextMenu
 * @extends React.Component
 */
// eslint-disable-next-line
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
      metaDataModalVisible: false,
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
    switch (key) {
      case 'info':
        this.changeInfoModalVisibility();
        break;
      case 'metadata':
        this.changeMetadataModalVisibility();
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
   * Opens the metadata window for the current layer.
   */
  changeMetadataModalVisibility() {
    this.setState({
      metaDataModalVisible: !this.state.metaDataModalVisible,
      menuHidden: true
    });
  }


  /**
   * The render function.
   */
  render() {
    const {
      t,
      layer
    } = this.props;

    const {
      infoModalVisible,
      menuHidden,
      metaDataModalVisible
    } = this.state;

    const showDesciption = !_isEmpty(layer.get('description'));
    const showMetadata = !_isEmpty(layer.get('metadataIdentifier')) && layer.get('showMetadataInClient');

    const settingsMenu = (
      <Menu
        selectable={false}
        onClick={this.onContextMenuItemClick}
      >
        {
          showDesciption &&
          <MenuItem
            key="info"
          >
            {t('LayerTreeDropdownContextMenu.layerInfoText')}
          </MenuItem>
        }
        {
          showMetadata &&
          <MenuItem
            key="metadata"
          >
            {t('LayerTreeDropdownContextMenu.layerMetadataText')}
          </MenuItem>
        }
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
          <span
            className="fa fa-cog layer-tree-node-title-settings"
          />
        </Dropdown>
        {metaDataModalVisible ?
          <Metadata
            layer={layer}
            t={t}
            onCancel={() => this.changeMetadataModalVisibility()} >
          </Metadata> : null}
      </div>
    );
  }
}

export default LayerTreeDropdownContextMenu;
