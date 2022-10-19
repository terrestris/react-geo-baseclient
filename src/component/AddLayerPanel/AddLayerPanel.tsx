import React from 'react';
import { connect } from 'react-redux';

import OlMap from 'ol/Map';
import OlLayerGroup from 'ol/layer/Group';
import OlLayerBase from 'ol/layer/Base';

import {
  Checkbox,
  Input
} from 'antd';

import AddWmsLayerEntry from '@terrestris/react-geo/dist/Container/AddWmsPanel/AddWmsLayerEntry/AddWmsLayerEntry';
import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';
import Titlebar from '@terrestris/react-geo/dist/Panel/Titlebar/Titlebar';

import MapUtil from '@terrestris/ol-util/dist/MapUtil/MapUtil';
import CapabilitiesUtil from '@terrestris/ol-util/dist/CapabilitiesUtil/CapabilitiesUtil';

import './AddLayerPanel.css';
import { WmsLayer } from '@terrestris/react-geo/dist/Util/typeUtils';

// default props
interface DefaultAddLayerPanelProps {
  onCancel: () => any;
  url: string;
  t: (arg: string) => string;
}

interface AddLayerPanelProps extends Partial<DefaultAddLayerPanelProps> {
  map: OlMap;
  dispatch: (arg: any) => void;
}

interface AddLayerPanelState {
  fetching: boolean;
  url: string;
  layers: WmsLayer[];
  selectedLayers: WmsLayer[];
}

class AddLayerPanel extends React.Component<AddLayerPanelProps, AddLayerPanelState>  {
  /**
   * The defaultProps.
   * @type {Object}
   */
  static defaultProps: DefaultAddLayerPanelProps = {
    onCancel: () => {},
    url: 'https://ows.terrestris.de/osm/service?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities',
    t: (arg: string) => arg
  };

  constructor(props: AddLayerPanelProps) {
    super(props);
    this.state = {
      fetching: false,
      url: props.url,
      layers: [],
      selectedLayers: []
    };
  }

  /**
   *
   * @param {*} url
   */
  getCapabilities = (url: string) => {
    this.setState({fetching: true});
    CapabilitiesUtil.parseWmsCapabilities(url)
      .then((capabilities: any) => CapabilitiesUtil.getLayersFromWmsCapabilities(capabilities, 'Title'))
      .then((layers: WmsLayer[]) => {this.setState({layers});})
      .finally(() => {this.setState({fetching: false});});
  };

  /**
   *
   * @param {*} selectedLayerTitles
   */
  onSelectionChange = (selectedLayerTitles: string[]) => {
    const filteredLayers = this.state.layers.filter(
      layer => selectedLayerTitles.includes(layer.get('title'))
    );
    this.setState({
      selectedLayers: filteredLayers
    });
  };

  /**
   *
   */
  onAddAllLayers = () => {
    const layers = this.state.layers;
    this.addLayers(layers);
  };

  /**
   *
   */
  onAddSelectedLayers = () => {
    const layers = this.state.selectedLayers;
    this.addLayers(layers);
  };

  /**
   *
   * @param {*} layers
   */
  addLayers = (layers: OlLayerBase[]) => {
    const map = this.props.map;
    let targetGroup = MapUtil.getLayerByName(map, 'external_layer_group');

    if (!targetGroup) {
      targetGroup = new OlLayerGroup();
      targetGroup.set('name', 'external_layer_group');
      map.getLayerGroup().getLayers().insertAt(0, targetGroup);
    }

    if (layers.length > 0) {
      targetGroup.set('hideInLayertree', false);
    }

    layers.forEach(layer => {
      // @ts-ignore
      if (layer instanceof OlLayerGroup && !targetGroup.getLayers().getArray().includes(layer) ) {
        // @ts-ignore
        targetGroup.getLayers().push(layer);
      }
    });
  };

  render() {
    const {
      fetching,
      layers,
      selectedLayers,
      url
    } = this.state;
    const {
      onCancel,
      t
    } = this.props;

    return (
      <div className="add-layer-panel">
        <div className="add-layer-panel-body">
          <div className="get-capabilities-url">
            <span className="get-capabilities-url-label">
              {t('AddLayerPanel.url')}
            </span>
            <Input.Search
              placeholder={t('AddLayerPanel.enterUrl')}
              value={url}
              onChange={event => {
                this.setState({ url: event.target.value });
              }}
              onSearch={this.getCapabilities}
              enterButton={true}
            />
          </div>
          <Checkbox.Group
            onChange={this.onSelectionChange}
          >
            {fetching ? t('General.loading') : layers.map((layer, idx) => {
              return <AddWmsLayerEntry
                wmsLayer={layer}
                key={idx} />;
            })}
          </Checkbox.Group>
        </div>
        <Titlebar
          style={{
            minHeight: '34px'
          }}
          tools={[
            <SimpleButton
              size="small"
              key="useSelectedBtn"
              disabled={selectedLayers.length === 0}
              onClick={this.onAddSelectedLayers}
            >
              {t('AddLayerPanel.addSelectedLayers')}
            </SimpleButton>,
            <SimpleButton
              size="small"
              key="useAllBtn"
              disabled={layers.length === 0}
              onClick={this.onAddAllLayers}
            >
              {t('AddLayerPanel.addAllLayers')}
            </SimpleButton>,
            onCancel ?
              <SimpleButton
                size="small"
                key="cancelBtn"
                onClick={onCancel}
              >
                {t('General.cancel')}
              </SimpleButton> : null
          ]} />
      </div>
    );
  }
}

export default connect()(AddLayerPanel);
