import React from 'react';

import OlLayerBase from 'ol/layer/Base';
import OlMap from 'ol/Map';
import { transformExtent } from 'ol/proj';

import {
  Menu,
  Dropdown,
  Modal,
  notification,
  Spin
} from 'antd';
const MenuItem = Menu.Item;

import _isEmpty from 'lodash/isEmpty';

import LayerUtil from '@terrestris/ol-util/dist/LayerUtil/LayerUtil';

import Logger from '@terrestris/base-util/dist/Logger';

import Metadata from '../../Modal/Metadata/Metadata';

interface LayerTreeDropdownContextMenuDefaultProps {
  showZoomToLayerExtent: boolean;
}

interface LayerTreeDropdownContextMenuProps {
  layer: OlLayerBase;
  t: (arg: string) => {};
  map: OlMap;
}

interface LayerTreeDropdownContextMenuState {
  infoModalVisible: boolean;
  menuHidden: boolean;
  metaDataModalVisible: boolean;
  isLoadingExtent: boolean;
}

type ComponentProps = LayerTreeDropdownContextMenuDefaultProps & LayerTreeDropdownContextMenuProps;

/**
 * Class LayerTreeDropdownContextMenu.
 *
 * @class LayerTreeDropdownContextMenu
 * @extends React.Component
 */
// eslint-disable-next-line
export class LayerTreeDropdownContextMenu extends React.Component<ComponentProps, LayerTreeDropdownContextMenuState> {


  public static defaultProps: LayerTreeDropdownContextMenuDefaultProps = {
    showZoomToLayerExtent: true
  };
  /**
   * Creates the LayerTreeDropdownContextMenu.
   *
   * @constructs LayerTreeDropdownContextMenu
   */
  constructor(props: ComponentProps) {
    super(props);

    // binds
    this.onContextMenuItemClick = this.onContextMenuItemClick.bind(this);
    this.changeInfoModalVisibility = this.changeInfoModalVisibility.bind(this);
    this.onDropdownMenuVisibleChange = this.onDropdownMenuVisibleChange.bind(this);

    this.state = {
      infoModalVisible: false,
      metaDataModalVisible: false,
      menuHidden: true,
      isLoadingExtent: false
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
      case 'zoomToExtent':
        this.zoomToLayerExtent();
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

  async zoomToLayerExtent() {
    const {
      layer,
      map,
      t
    } = this.props;

    this.setState({
      isLoadingExtent: true
    });

    try {
      let extent = await LayerUtil.getExtentForLayer(layer, map.getView().getProjection());

      extent = transformExtent(extent, 'EPSG:4326', map.getView().getProjection());

      map.getView().fit(extent);
    } catch (error) {
      Logger.error(error);
      notification.error({
        message: t('LayerTreeDropdownContextMenu.extentError')
      });
    } finally {
      this.setState({
        isLoadingExtent: false,
        menuHidden: true
      });
    }
  };

  /**
   * The render function.
   */
  render() {
    const {
      t,
      layer,
      showZoomToLayerExtent
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
        {
          showZoomToLayerExtent &&
          <MenuItem
            key="zoomToExtent"
          >
            <Spin
              spinning={this.state.isLoadingExtent}
            >
              {t('LayerTreeDropdownContextMenu.layerZoomToExtent')}
            </Spin>
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
        {
          metaDataModalVisible &&
          <Metadata
            layer={layer}
            t={t}
            onCancel={() => this.changeMetadataModalVisibility()} >
          </Metadata>
        }
      </div>
    );
  }
}

export default LayerTreeDropdownContextMenu;
