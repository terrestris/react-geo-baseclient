import * as React from 'react';

import { AutoComplete } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import { transformExtent } from 'ol/proj';
import OlFormatGeoJSON from 'ol/format/GeoJSON';
import OlLayer from 'ol/layer/Base';
import OlSourceVector from 'ol/source/Vector';
import OlLayerVector from 'ol/layer/Vector';
import OlMap from 'ol/Map';
import OlStyle from 'ol/style/Style';
import OlStyleFill from 'ol/style/Fill';
import OlStyleStroke from 'ol/style/Stroke';
import OlStyleCircle from 'ol/style/Circle';
import { getUid } from 'ol/util';

import Logger from '@terrestris/base-util/dist/Logger';

import WfsSearchInput from '@terrestris/react-geo/dist/Field/WfsSearchInput/WfsSearchInput';
import NominatimSearch from '@terrestris/react-geo/dist/Field/NominatimSearch/NominatimSearch';

import MapUtil from '@terrestris/ol-util/dist/MapUtil/MapUtil';
import PermalinkUtil from '@terrestris/ol-util/dist/PermalinkUtil/PermalinkUtil';

import CsrfUtil from '@terrestris/base-util/dist/CsrfUtil/CsrfUtil';

import './Multisearch.css';
import { Extent } from 'ol/extent';
import { isEqual } from 'lodash';

// default props
interface DefaultMultisearchProps {
  className: string;
  useNominatim: boolean;
  useWfs: boolean;
  minChars: number;
  nominatimSearchTitle: string;
  placeHolder: string;
  showResultsOnMap?: boolean;
  resultstyle?: OlStyle;
  hoverstyle?: OlStyle;
}

interface MultisearchProps extends Partial<DefaultMultisearchProps> {
  map: OlMap;
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
    placeHolder: 'search location or data',
    showResultsOnMap: false,
    resultstyle: new OlStyle({
      fill: new OlStyleFill({
        color: 'rgba(255,255,255,0.5)'
      }),
      stroke: new OlStyleStroke({
        color: 'blue',
        width: 4
      }),
      image: new OlStyleCircle({
        radius: 10,
        fill: new OlStyleFill({
          color: 'blue'
        }),
        stroke: new OlStyleStroke({
          color: 'black',
          width: 3
        })
      })
    }),
    hoverstyle: new OlStyle({
      fill: new OlStyleFill({
        color: 'rgba(255,255,255,0.5)'
      }),
      stroke: new OlStyleStroke({
        color: 'red',
        width: 7
      }),
      image: new OlStyleCircle({
        radius: 10,
        fill: new OlStyleFill({
          color: 'red'
        }),
        stroke: new OlStyleStroke({
          color: 'black',
          width: 5
        })
      })
    })
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
        // searchAttributes[conf.featureTypeName] = {};
        // conf.attributes.forEach((attr: string) => {
        //   searchAttributes[conf.featureTypeName][attr] = {
        //     matchCase: false,
        //     type: 'text',
        //     exactSearch: false
        //   };
        // });
        // searchAttributes[conf.featureTypeName]['the_geom'] = {};
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

  componentDidUpdate(prevProps: any, prevState: any) {
    if (!isEqual(this.state.wfsFeatures, prevState.wfsFeatures)) {
      this.removeHoverFeatures();
      if (this.props.showResultsOnMap) {
        this.showSearchResultsOnMap();
      }
    }
  }

  removeHoverFeatures() {
    let layer = MapUtil.getLayersByProperty(
      this.props.map, 'name', 'multisearchhoverresults')[0] as OlLayerVector<OlSourceVector>;
    if (layer) {
      layer.getSource().clear();
    }
  }

  showSearchResultsOnMap() {
    const {
      map,
      resultstyle
    } = this.props;
    const {
      wfsFeatures
    } = this.state;
    let layer = MapUtil.getLayersByProperty(
      map, 'name', 'multisearchresults')[0] as OlLayerVector<OlSourceVector>;
    if (!layer) {
      layer = new OlLayerVector({
        source: new OlSourceVector(),
        style: resultstyle
      });
      layer.set('name', 'multisearchresults');
      map.addLayer(layer);
    }
    const source = layer.getSource();
    source.clear();
    const geoJsonFormat = new OlFormatGeoJSON();
    const olFeatures = geoJsonFormat.readFeatures({
      type: 'FeatureCollection',
      features: wfsFeatures},
    {
      dataProjection: 'EPSG:3857',
      featureProjection: map.getView().getProjection()
    });
    source.addFeatures(olFeatures);
  }

  hoverFeature(evt: any) {
    const {
      map,
      hoverstyle
    } = this.props;
    const {
      wfsFeatures
    } = this.state;

    const feature = wfsFeatures.find(
      el => el.id === evt.target.getAttribute('wfsfeatureid'));

    if (!feature) {
      return;
    }

    let layer = MapUtil.getLayersByProperty(
      map, 'name', 'multisearchhoverresults')[0] as OlLayerVector<OlSourceVector>;
    if (!layer) {
      layer = new OlLayerVector({
        source: new OlSourceVector(),
        style: hoverstyle
      });
      layer.set('name', 'multisearchhoverresults');
      map.addLayer(layer);
    }
    const source = layer.getSource();
    source.clear();
    const geoJsonFormat = new OlFormatGeoJSON();
    const olFeature = geoJsonFormat.readFeature(
      feature,
      {
        dataProjection: 'EPSG:3857',
        featureProjection: map.getView().getProjection()
      });
    source.addFeature(olFeature);
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
      onMouseEnter: this.hoverFeature.bind(this),
      label: (
        <div className='multi-search-result-entry'>
          {title}
        </div>
      ),
    };
  }

  /**
   * Replaces all occurencies of templated properties by its values.
   *
   * @param tpl Display template
   */
  getDisplayValueFromTemplate(displayTpl: string, feature: any): string {
    let displayValue: string;
    const matches = displayTpl.match(/\{(.*?)\}/g);
    if (matches) {
      displayValue = displayTpl;
      const keysToReplace = matches.map((mKey: string) => mKey.replace(/[{}]/g, ''));
      keysToReplace.forEach((rKey: string) => {
        const tplRegex = new RegExp('\\{' + rKey + '\\}');
        const tplValue = feature.properties[rKey];
        displayValue = displayValue.replace(tplRegex, tplValue);
      });
    }
    return displayValue;
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
          const searchConf = this.state.searchConfig[config];
          if (config && searchConf.displayTemplate) {
            let displayTpl = searchConf.displayTemplate;
            title = this.getDisplayValueFromTemplate(displayTpl, f);
          } else {
            const displayAttributes = searchConf.attributes;
            title = f.properties[displayAttributes[0]];
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
    const {
      map
    } = this.props;

    let feature: any;

    this.setState({
      fetching: false
    });

    if (selection.nominatimfeatureid) {
      feature = this.state.nominatimFeatures.find(
        el => el.osm_id === selection.nominatimfeatureid);
      const olView = map.getView();
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
      const olView = map.getView();
      const geoJsonFormat = new OlFormatGeoJSON();
      const olFeature = geoJsonFormat.readFeature(feature, {
        dataProjection: 'EPSG:3857',
        featureProjection: map.getView().getProjection()
      });

      const geometry = olFeature.getGeometry();

      if (geometry) {
        olView.fit(geometry.getExtent(), {
          duration: 500
        });
      }

      // make layer visible
      const searchLayers = MapUtil.getLayersByProperty(map, 'searchable', true);
      const layer = searchLayers.find((l: any) =>
        l.get('searchConfig').featureTypeName.indexOf(
          feature.id.split('.')[0]) > -1);
      if (layer && !layer.getVisible()) {
        layer.setVisible(true);
        // also make all parent folders / groups visible so
        // that the layer becomes visible in map
        PermalinkUtil.setParentsVisible(
          map,
          map.getLayerGroup().getLayers(),
          getUid(layer)
        );
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
