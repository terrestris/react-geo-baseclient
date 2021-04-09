import * as React from 'react';

import { AutoComplete } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import { transformExtent } from 'ol/proj';
import OlFormatGeoJSON from 'ol/format/GeoJSON';
import OlLayer from 'ol/layer/Base';

import Logger from '@terrestris/base-util/dist/Logger';

import WfsSearchInput from '@terrestris/react-geo/dist/Field/WfsSearchInput/WfsSearchInput';
import NominatimSearch from '@terrestris/react-geo/dist/Field/NominatimSearch/NominatimSearch';

import MapUtil from '@terrestris/ol-util/dist/MapUtil/MapUtil';

import CsrfUtil from '@terrestris/base-util/dist/CsrfUtil/CsrfUtil';

import './Multisearch.css';
import { Extent } from 'ol/extent';

// default props
interface DefaultMultisearchProps {
  className: string;
  useNominatim: boolean;
  useWfs: boolean;
  minChars: number;
  nominatimSearchTitle: string;
  placeHolder: string;
}

interface MultisearchProps extends Partial<DefaultMultisearchProps> {
  map: any;
  wfsSearchBaseUrl?: string;
}

interface MultisearchState {
  searchTerm: string;
  wfsResults: any[];
  wfsFeatures: any[];
  nominatimResults: any[];
  nominatimFeatures: any[];
  fetching: boolean;
  options: any[];
  searchAttributes: any;
  searchConfig: any;
  wfsSearchPending: boolean;
  nominatimSearchPending: boolean;
}

/**
 * Class representing the Multisearch.
 *
 * @class Multisearch
 * @extends React.Component
 */
export default class Multisearch extends
  React.Component<MultisearchProps, MultisearchState> {

  public static defaultProps: DefaultMultisearchProps = {
    className: 'multisearch',
    useNominatim: true,
    useWfs: true,
    minChars: 3,
    nominatimSearchTitle: 'Nominatim',
    placeHolder: 'search location or data'
  };

  /**
   * Create the Multisearch.
   *
   * @constructs Multisearch
   */
  constructor(props: MultisearchProps) {
    super(props);

    if (this.props.useWfs && !this.props.wfsSearchBaseUrl) {
      Logger.warn('You need to configure a base URL for the WFS search');
    }

    const searchLayers = MapUtil.getLayersByProperty(
      this.props.map, 'searchable', true);
    const searchConfig = {};
    const searchAttributes = {};
    searchLayers.forEach((l: OlLayer) => {
      const conf = l.get('searchConfig');
      if (conf) {
        searchConfig[conf.featureTypeName] = conf;
        searchAttributes[conf.featureTypeName] = conf.attributes;
      }
    });

    this.state = {
      searchTerm: '',
      wfsResults: [],
      wfsFeatures: [],
      nominatimResults: [],
      nominatimFeatures: [],
      fetching: false,
      options: [],
      searchConfig,
      searchAttributes,
      wfsSearchPending: false,
      nominatimSearchPending: false
    };
  }

  renderTitle(title: string, count: number) {
    return (
      <span className='multi-search-result-layer-title'>
        {title}
        <div>{count}</div>
      </span>
    );
  }

  renderItem(title: string, nominatimFeature: any, wfsFeature: any) {
    // we need to add some random stuff to the value as antd behaves wrong
    // when having multiple items / options with the same value
    return {
      value: title + '|uniqifier|' + Math.random(),
      key: Math.random(),
      nominatimfeatureid: nominatimFeature ? nominatimFeature.osm_id : null,
      wfsfeatureid: wfsFeature ? wfsFeature.id : null,
      label: (
        <div className='multi-search-result-entry'>
          {title}
        </div>
      ),
    };
  }

  onNominatimSearchSuccess(data: any) {
    this.setState({
      fetching: this.props.useWfs && this.state.wfsSearchPending,
      nominatimSearchPending: false,
      nominatimFeatures: data,
      nominatimResults: [{
        label: this.renderTitle(this.props.nominatimSearchTitle, data.length),
        options: data.map((el: any) => this.renderItem(
          el.display_name, el, null))
      }]
    });
  }

  wfsSearchSuccess(data: any) {
    const results = {};
    data.forEach((el: any) => {
      const ft = el.id.substring(0, el.id.lastIndexOf('.'));
      results[ft] = {
        features: [],
        count: 0
      };
    });
    data.forEach((el: any) => {
      const ft = el.id.substring(0, el.id.lastIndexOf('.'));
      results[ft].features.push(el);
      results[ft].count++;
    });
    Object.keys(results).map((key) => {
      const searchLayers = MapUtil.getLayersByProperty(
        this.props.map, 'searchable', true);
      searchLayers.forEach((l: any) => {
        const config = l.get('searchConfig');
        if (config && config.featureTypeName &&
            config.featureTypeName.indexOf(key) > -1) {
          results[key].title = l.get('name');
        }
      });
    });

    const wfsResults = Object.keys(results).map((key) => {
      return {
        label: this.renderTitle(results[key].title, results[key].count),
        options: results[key].features.map((f: any) => {
          const ft = f.id.substring(0, f.id.lastIndexOf('.'));
          const config: any = Object.keys(this.state.searchConfig).
            find(fqft => {
              let unqualifiedFeatureType = fqft;
              if (unqualifiedFeatureType.indexOf(':') > 0) {
                unqualifiedFeatureType = unqualifiedFeatureType.split(':')[1];
              }
              if (unqualifiedFeatureType === ft) {
                return true;
              }
              return false;
            });
          let title = '';
          if (config && this.state.searchConfig[config].displayTemplate) {
            let attr = this.state.searchConfig[config].displayTemplate;
            attr = attr.match(/\{(.*?)\}/g).map((el: any) => el.replaceAll(
              '{', '').replaceAll('}', ''));
            attr.forEach((prop: any) => {
              title += f.properties[prop];
            });
          } else {
            title = f.properties[Object.keys(f.properties)[0]];
          }
          return this.renderItem(title, null, f);
        })
      };
    });
    this.setState({
      fetching: this.props.useNominatim && this.state.nominatimSearchPending,
      wfsSearchPending: false,
      wfsFeatures: data,
      wfsResults
    });
  }

  onFetchError() {
    this.setState({
      nominatimResults: [],
      nominatimFeatures: [],
      wfsResults: [],
      wfsFeatures: [],
      fetching: false,
      wfsSearchPending: false,
      nominatimSearchPending: false
    });
  }

  onUpdateInput(val: string) {
    const fetching = val && val !== '' && val.length >= this.props.minChars;
    if (val) {
      // remove a possible given unique random string which is needed
      // to work around an antd issue with identical values in options
      val = val.split('|uniqifier|')[0];
    }
    this.setState({
      searchTerm: val,
      fetching,
      wfsSearchPending: fetching && this.props.useWfs,
      nominatimSearchPending: fetching && this.props.useNominatim
    });
  }

  resetSearch() {
    this.setState({
      searchTerm: '',
      nominatimResults: [],
      nominatimFeatures: [],
      wfsResults: [],
      wfsFeatures: [],
      fetching: false,
      wfsSearchPending: false,
      nominatimSearchPending: false
    });
  }

  onSelect(text: string, selection: any) {
    let feature: any;
    if (selection.nominatimfeatureid) {
      feature = this.state.nominatimFeatures.find(
        el => el.osm_id === selection.nominatimfeatureid);
      const olView = this.props.map.getView();
      const extent: [string, string, string, string] = [
        feature.boundingbox[2],
        feature.boundingbox[0],
        feature.boundingbox[3],
        feature.boundingbox[1]
      ];

      let olExtent: Extent = extent.map((coord: string) => {
        return parseFloat(coord);
      }) as Extent;

      olExtent = transformExtent(olExtent, 'EPSG:4326',
        olView.getProjection().getCode());

      olView.fit(olExtent, {
        duration: 500
      });
      return;
    } else {
      feature = this.state.wfsFeatures.find(
        el => el.id === selection.wfsfeatureid);
      const olView = this.props.map.getView();
      const geoJsonFormat = new OlFormatGeoJSON();
      const olFeature = geoJsonFormat.readFeature(feature);
      const geometry = olFeature.getGeometry();

      if (geometry) {
        olView.fit(geometry, {
          duration: 500
        });
      }

      // make layer visible
      const searchLayers = MapUtil.getLayersByProperty(
        this.props.map, 'searchable', true);
      const layer = searchLayers.find((l: any) =>
        l.get('searchConfig').featureTypeName.indexOf(
          feature.id.split('.')[0]) > -1);
      if (layer && !layer.getVisible()) {
        layer.setVisible(true);
      }
    }
  }

  /**
   * The render function
   */
  render() {
    const {
      map,
      className,
      useNominatim,
      useWfs,
      wfsSearchBaseUrl,
      minChars,
      placeHolder
    } = this.props;

    const {
      searchTerm,
      wfsResults,
      nominatimResults,
      searchAttributes,
      searchConfig,
      fetching
    } = this.state;

    return (
      <div className={'multisearch ' + className}>
        <AutoComplete
          allowClear={true}
          dropdownClassName="multisearch-dropdown"
          onChange={this.onUpdateInput.bind(this)}
          onSearch={this.onUpdateInput.bind(this)}
          options={nominatimResults.concat(wfsResults)}
          onSelect={this.onSelect.bind(this)}
          onClear={this.resetSearch.bind(this)}
          placeholder={placeHolder}
          value={searchTerm}
        >
        </AutoComplete>
        <div className={`loader ${fetching ? 'active' : 'hidden'}`}>
          <LoadingOutlined />
        </div>
        {useNominatim &&
            <NominatimSearch
              countryCodes={''}
              map={map}
              minChars={minChars}
              visible={false}
              searchTerm={searchTerm}
              onFetchSuccess={this.onNominatimSearchSuccess.bind(this)}
              onFetchError={this.onFetchError.bind(this)}
            />
        }
        {useWfs &&
           <WfsSearchInput
             map={map}
             minChars={minChars}
             baseUrl={wfsSearchBaseUrl}
             featureTypes={Object.keys(searchConfig)}
             onFetchSuccess={this.wfsSearchSuccess.bind(this)}
             onFetchError={this.onFetchError.bind(this)}
             searchAttributes={searchAttributes}
             visible={false}
             searchTerm={searchTerm}
             additionalFetchOptions={{
               headers: CsrfUtil.getHeaderObject()
             }}
           />
        }
      </div>
    );
  }
}
