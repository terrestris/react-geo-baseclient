import React, { useState } from 'react';

import { MenuInfo } from 'rc-menu/lib/interface';

import OlLayerBase from 'ol/layer/Base';
import OlLayerLayer from 'ol/layer/Layer';
import OlMap from 'ol/Map';
import { transformExtent } from 'ol/proj';
import {Extent as OlExtent} from 'ol/extent';
import TileWMS from 'ol/source/TileWMS';
import ImageWMS from 'ol/source/ImageWMS';
import LayerRenderer from 'ol/renderer/Layer';

import {
  Menu,
  Dropdown,
  Modal,
  notification,
  Spin
} from 'antd';
const MenuItem = Menu.Item;

import _isEmpty from 'lodash/isEmpty';
import _isFinite from 'lodash/isFinite';

import LayerUtil from '@terrestris/ol-util/dist/LayerUtil/LayerUtil';

import Logger from '@terrestris/base-util/dist/Logger';

import Metadata from '../../Modal/Metadata/Metadata';

interface LayerTreeDropdownContextMenuDefaultProps {
  showZoomToLayerExtent?: boolean;
  showZoomToLayerResolution?: boolean;
}

interface LayerTreeDropdownContextMenuProps {
  layer: OlLayerBase;
  t: (arg: string) => string;
  map: OlMap;
}

type ComponentProps = LayerTreeDropdownContextMenuDefaultProps & LayerTreeDropdownContextMenuProps;

/**
 * Class LayerTreeDropdownContextMenu.
 *
 * @class LayerTreeDropdownContextMenu
 * @extends React.Component
 */
export const LayerTreeDropdownContextMenu: React.FC<ComponentProps> = ({
  showZoomToLayerExtent = false,
  showZoomToLayerResolution = false,
  layer,
  t,
  map
}): JSX.Element => {

  const [infoModalVisible, setInfoModalVisible] = useState<boolean>(false);
  const [metadataModalVisible, setMetadataModalVisible] = useState<boolean>(false);
  const [menuHidden, setMenuHidden] = useState<boolean>(true);
  const [extentLoading, setExtentLoading] = useState<boolean>(false);

  /**
   * Called if the an item of the layer context/settings menu has been clicked.
   *
   * @param {Object} evt The click event.
   */
  const onContextMenuItemClick = (evt: MenuInfo): void => {
    const key = evt.key;
    switch (key) {
      case 'info':
        changeInfoModalVisibility();
        break;
      case 'metadata':
        changeMetadataModalVisibility();
        break;
      case 'zoomToExtent':
        zoomToLayerExtent();
        break;
      case 'zoomToResolution':
        zoomToLayerResolution();
        break;
      default:
        break;
    }
    setMenuHidden(true);
  };

  /**
   * Handles visibility of the dropdown menu
   *
   */
  const onDropdownMenuVisibleChange = (visible: boolean): void => {
    setMenuHidden(!visible);
  };

  /**
   * Opens the info modal window for the current layer.
   */
  const changeInfoModalVisibility = (): void => {
    setInfoModalVisible(!infoModalVisible);
  };

  /**
   * Opens the metadata window for the current layer.
   */
  const changeMetadataModalVisibility = (): void => {
    setMetadataModalVisible(!metadataModalVisible);
  };

  /**
   * Tries to retrieve the layer extent from capabilities and fits map view to
   * the bounds on success.
   */
  const zoomToLayerExtent = async (): Promise<void> => {

    setExtentLoading(true);

    try {
      let extent: OlExtent = await LayerUtil.getExtentForLayer(layer as OlLayerLayer<TileWMS | ImageWMS,
        LayerRenderer<any>>);
      extent = transformExtent(extent, 'EPSG:4326', map.getView().getProjection());
      map.getView().fit(extent);
    } catch (error) {
      Logger.error(error);
      notification.error({
        message: t('LayerTreeDropdownContextMenu.extentError')
      });
    } finally {
      setExtentLoading(false);
    }
  };

  /**
   * Zooms map view to max layer resolution.
   */
  const zoomToLayerResolution = (): void => {
    const mapResolutions = map.getView().getResolutions();
    let maxResolution = layer.getMaxResolution();

    if (_isFinite(maxResolution) && maxResolution !== 0) {
      const closestMapResolution = mapResolutions.reduce((prev, curr) =>
        Math.abs(curr - maxResolution) < Math.abs(prev - maxResolution) ? curr : prev
      );
      const zoomToResolution = mapResolutions.indexOf(closestMapResolution) + 1;
      map.getView().setZoom(zoomToResolution);
    } else {
      // use map's min zoom as fallback if resolutions is not restricted on layer
      map.getView().setZoom(0);
    }
  };

  const showDesciption = !_isEmpty(layer.get('description'));
  const showMetadata = !_isEmpty(layer.get('metadataIdentifier')) && layer.get('showMetadataInClient');

  const settingsMenu = (
    <Menu
      selectable={false}
      onClick={onContextMenuItemClick}
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
            spinning={extentLoading}
          >
            {t('LayerTreeDropdownContextMenu.layerZoomToExtent')}
          </Spin>
        </MenuItem>
      }
      {
        showZoomToLayerResolution &&
        <MenuItem
          key="zoomToResolution"
        >
          {t('LayerTreeDropdownContextMenu.layerZoomToResolution')}
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
        onCancel={() => changeInfoModalVisibility()}
      >
        <div>{layer.get('description')}</div>
      </Modal>
      <Dropdown
        overlay={settingsMenu}
        placement="bottomLeft"
        onVisibleChange={onDropdownMenuVisibleChange}
        visible={!menuHidden}
        trigger={['click']}
      >
        <span
          className="fa fa-cog layer-tree-node-title-settings"
        />
      </Dropdown>
      {
        metadataModalVisible &&
        <Metadata
          layer={layer}
          t={t}
          onCancel={() => changeMetadataModalVisibility()}>
        </Metadata>
      }
    </div>
  );
};

export default LayerTreeDropdownContextMenu;
