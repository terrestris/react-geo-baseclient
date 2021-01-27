import * as React from 'react';
import i18n from '../../i18n';

import OlMap from 'ol/Map';
import OlFeature from 'ol/Feature';
import OlGeomGeometry from 'ol/geom/Geometry';

import {
  Pagination
} from 'antd';

import AgFeatureGrid from '@terrestris/react-geo/dist/Grid/AgFeatureGrid/AgFeatureGrid';
import { MapUtil } from '@terrestris/ol-util/dist/MapUtil/MapUtil';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import './FeatureInfoGrid.css';

import _isEqual from 'lodash/isEqual';
import _isEmpty from 'lodash/isEmpty';
import _uniqueId from 'lodash/uniqueId';
import _upperFirst from 'lodash/upperFirst';

interface DefaultFeatureInfoGridProps {
}

interface FeatureInfoGridProps extends Partial<DefaultFeatureInfoGridProps> {
  /**
   * Array of features to be shown inside of grid using pagination
   */
  features: OlFeature[];

  /**
   * OL map
   */
  map: OlMap;

  /**
   * Vector layer used for highlighting of currently shown feature.
   */
  hoverVectorLayer: any; // OlLayerVector

  isTimeLayer: boolean; // Boolean

  downloadGridData: any; // Property to download grid data

  onPaginationChange?: (idx: number) => void;

  /**
   * Translate function
   */
  t: (arg: any) => void;
}

interface FeatureInfoGridState {
  currentPage: number;
  selectedFeat: OlFeature;
  gridApi: any;
}

/**
 * Class representing a feature info grid.
 *
 * @class The FeatureInfoGrid.
 * @extends React.Component
 */
export class FeatureInfoGrid extends React.Component<FeatureInfoGridProps, FeatureInfoGridState> {

  /**
   * The default properties.
   */
  public static defaultProps: DefaultFeatureInfoGridProps = {
  };

  /**
   * Create a feature info grid component.
   * @constructs FeatureInfoGrid
   */
  constructor(props: FeatureInfoGridProps) {
    super(props);

    props.features[0].set('selectedFeat', true);

    this.state = {
      selectedFeat: props.features[0],
      currentPage: 1,
      gridApi: {}
    };

    // binds
    this.updateSize = this.updateSize.bind(this);
    this.onPaginationChange = this.onPaginationChange.bind(this);
    this.getTimeFeatureColumnDefs = this.getTimeFeatureColumnDefs.bind(this);
    this.getTimeFeatureRowData = this.getTimeFeatureRowData.bind(this);
    this.downloadData = this.downloadData.bind(this);
    this.onGridIsReady = this.onGridIsReady.bind(this);
  }

  /**
   * The componentDidUpdate function
   *
   * @param {FeatureInfoGridProps} prevProps Previous props.
   * @param {FeatureInfoGridState} prevState Previous state.
   */
  componentDidUpdate(prevProps: FeatureInfoGridProps, prevState: FeatureInfoGridState) {
    const {
      features,
      downloadGridData
    } = this.props;

    const {
      selectedFeat
    } = this.state;

    if (!_isEqual(prevProps.features, features)) {
      features[0].set('selectedFeat', true);
      this.setState({
        selectedFeat: features[0],
        currentPage: 1
      });
    }
    if (!_isEqual(prevState.selectedFeat, selectedFeat)) {
      this.updateVectorLayer(selectedFeat);
    }

    if (!_isEqual(prevProps.downloadGridData, downloadGridData)) {
      this.downloadData();
    }
  }

  /**
   * Updates hover vector layer with currently shown feature in grid.
   *
   * @param {OlFeature} newFeat Feature to update.
   */
  updateVectorLayer(newFeat: OlFeature) {
    const {
      hoverVectorLayer
    } = this.props;
    const source = hoverVectorLayer.getSource();
    const oldRenderFeat = source.getFeatures().find(
      (f: OlFeature) => f.get('selectedFeat') === true);
    if (oldRenderFeat) {
      source.removeFeature(oldRenderFeat);
    }
    source.addFeature(newFeat);
  }

  /**
   * Updates feature grid on pagination change.
   *
   * @param {Number} newIdx
   */
  onPaginationChange(newIdx: number) {
    const selectedFeat = this.props.features[newIdx - 1];
    selectedFeat.set('selectedFeat', true);
    this.setState({
      selectedFeat,
      currentPage: newIdx
    });
    if (this.props.onPaginationChange) {
      this.props.onPaginationChange(newIdx);
    }
  }

  /**
   * Generates HTML link for attributes which value refers to external URL,
   * returns original attribute value otherwise.
   *
   * @param {String} text Attribute value
   * @return {ReactElement|String} Hyperlink element or original attribute value
   */
  getColumnText(text: any): string | React.ReactElement {
    const colText = text.value;
    if (colText && colText.toString().toLowerCase().indexOf('http') > -1) {
      return `<a href=${colText} target='_blank'>Link</a>`;
    }
    return colText;
  }

  /**
   * Returns column definition for feature grid.
   */
  getColumnDefs(): any[] {
    const {
      t
    } = this.props;
    // feature attribute grid has two columns (NAME/VALUE) which are
    // always the same for all feature types.
    return [{
      headerName: t('FeatureInfoGrid.gfiAttributeNameColumnText'),
      field: 'attr',
      minWidth: 100
    }, {
      headerName: t('FeatureInfoGrid.gfiAttributeValueColumnText'),
      field: 'val',
      minWidth: 200,
      cellRenderer: (text: string) => this.getColumnText(text)
    }];
  }

  /**
   * Returns column definition for feature grid of time interval based
   * features.
   */
  getTimeFeatureColumnDefs(): any[] {
    const {
      selectedFeat
    } = this.state;

    const columnDefs: any[] = [];

    Object.keys(selectedFeat.getProperties()).forEach(featureColumnKey => {
      const prop = selectedFeat.get(featureColumnKey);
      if (
        prop instanceof OlGeomGeometry ||
        (typeof prop !== 'string' && typeof prop !== 'number')
      ) {
        return;
      }
      if (featureColumnKey === 'layerName') {
        return;
      }
      columnDefs.push({
        headerName: featureColumnKey,
        field: featureColumnKey,
        minWidth: 100
      });
    });

    return columnDefs;
  }

  /**
   * Prepare attribute configuration by filtering of some special non string based
   * values (e.g. geometry). Also consider possibly configured visible attribute
   * configuration set on certain layer.
   */
  getDisplayedAttributeConfiguration(feat: OlFeature): any {
    const featProps = feat.getProperties();
    let propKeys = Object.keys(featProps);
    const layerName = feat.get('layerName');
    const layer = MapUtil.getLayerByNameParam(this.props.map, layerName);
    const displayColumns = layer && layer.get('displayColumns');
    const i18nLang = i18n.language;
    const lang = i18nLang || window?.localStorage?.i18nextLng?.toLowerCase() || 'de';
    const attrAliases = layer && layer.get(`columnAliases${_upperFirst(lang)}`);

    // remove geometry prop as well as all non string based or non numeric props
    propKeys = propKeys.filter((propKey: string) => {
      const prop = featProps[propKey];
      if (prop instanceof OlGeomGeometry || (typeof prop !== 'string' && typeof prop !== 'number')) {
        return false;
      }
      if (propKey === 'layerName') {
        return false;
      }
      return true;
    });

    // take possibly configured displayed columns into account
    if (!_isEmpty(displayColumns)) {
      propKeys = propKeys.filter(prop => displayColumns.includes(prop));
    }
    return {
      propKeys,
      attrAliases
    };
  }

  /**
   * Returns prepared row data for the grid.
   * @param {OlFeature} feat Feature which properties should be shown in grid.
   * @return {Array} Data array.
   */
  getRowData(feat: OlFeature): any[] {
    const rowData: any[] = [];
    const featProps = feat.getProperties();
    const {
      propKeys,
      attrAliases
    } = this.getDisplayedAttributeConfiguration(feat);

    propKeys.forEach((propKey: string) => {
      rowData.push({
        id: _uniqueId('propId-'),
        attr: attrAliases && attrAliases[propKey] ? attrAliases[propKey] : propKey,
        val: featProps[propKey]
      });
    });
    return rowData;
  }

  /**
   * Returns prepared row data for the grid for all time-based features.
   * @param {OlFeature} feat Feature whose time-based properties should be
   * displayed in the grid.
   * @return {Array} Data array.
   */
  getTimeFeatureRowData(feat: any): any[] {
    const {
      features
    } = this.props;

    const rowData: any[] = [];

    const featureLayerName: string = feat.get('layerName');
    const filterFeatures: any[] = features.filter(f => {
      return f.get('layerName') === featureLayerName;
    });

    filterFeatures.forEach((filterFeature: OlFeature) => {
      const colData = {};
      const {
        propKeys
      } = this.getDisplayedAttributeConfiguration(filterFeature);
      propKeys.forEach((propKey: string) => {
        colData[propKey] = filterFeature.get(propKey);
      });
      rowData.push(colData);
    });
    return rowData;
  }

  /**
   * Provides a function to download the grid data.
   * Only active when time-based layer is selected for FeatureRequest.
   */
  downloadData() {
    if (Object.keys(this.state.gridApi).length) {
      this.state.gridApi.exportDataAsCsv();
    }
  }

  /**
   * Returns `AgFeatureGrid` component for provided feature.
   *
   * @param {OlFeature} feat OlFeature which properties should be shown in grid.
   */
  getFeatureGrid(feat: any): React.ReactElement {

    const defaultColDef = {
      sortable: true,
      resizable: true,
      wrapText: true,
      autoHeight: true,
      cellClass: 'cell-wrap-text'
    };

    const {
      isTimeLayer,
      t
    } = this.props;

    return (
      <AgFeatureGrid
        map={null}
        width={'auto'}
        className="grid-content"
        height={'auto'}
        columnDefs={
          isTimeLayer ? this.getTimeFeatureColumnDefs() : this.getColumnDefs()
        }
        onGridIsReady={this.onGridIsReady}
        onGridSizeChanged={this.updateSize}
        defaultColDef={defaultColDef}
        suppressHorizontalScroll={true}
        rowData={
          isTimeLayer ? this.getTimeFeatureRowData(feat) : this.getRowData(feat)
        }
        selectable={false}
        localeText={{
          noRowsToShow: t('FeatureInfoGrid.noDataFoundText')
        }}
        modules={[ClientSideRowModelModule, CsvExportModule]}
      />
    );
  }

  /**
   * Will be executed, when the grid is ready.
   */
  onGridIsReady(featureGrid: any) {
    this.updateSize(featureGrid);
    this.setState({
      gridApi: featureGrid.api
    });
  }

  /**
   * Calls sizeColumnsToFit to fit the columns into available width.
   */
  updateSize(featureGrid: any) {
    featureGrid.api.sizeColumnsToFit();
  }

  /**
   * The render function.
   */
  render() {
    const {
      features,
      isTimeLayer
    } = this.props;

    const {
      currentPage,
      selectedFeat
    } = this.state;

    return (
      <div className='feature-grid-wrapper'>
        {!isTimeLayer &&
          <Pagination
            key="pagination"
            simple={true}
            hideOnSinglePage={true}
            size="small"
            current={currentPage}
            defaultCurrent={1}
            total={features.length}
            pageSize={1}
            onChange={this.onPaginationChange}
          />
        }
        {this.getFeatureGrid(selectedFeat)}
      </div>
    );
  }
}

export default FeatureInfoGrid;
