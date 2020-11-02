import * as React from 'react';
import OlGeomGeometry from 'ol/geom/Geometry';

import {
  Pagination
} from 'antd';

import AgFeatureGrid from '@terrestris/react-geo/dist/Grid/AgFeatureGrid/AgFeatureGrid';

import './FeatureInfoGrid.less';

const uniqueId = require('lodash/uniqueId');
const isEqual = require('lodash/isEqual');

interface DefaultFeatureInfoGridProps {
}

interface FeatureInfoGridProps extends Partial<DefaultFeatureInfoGridProps> {
  /**
   * Array of features to be shown inside of grid using pagination
   */
  features: any[]; // OlFeature[]

  /**
   * Vector layer used for highlighting of currently shown feature.
   */
  hoverVectorLayer: any; // OlLayerVector

  isTimeLayer: boolean; // Boolean

  /**
 * Translate function
 */
  t: (arg: any) => void;
}

interface FeatureInfoGridState {
  currentPage: number;
  selectedFeat: any; // OlFeature
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
      currentPage: 1
    };

    // binds
    this.updateSize = this.updateSize.bind(this);
    this.onPaginationChange = this.onPaginationChange.bind(this);
    this.getTimeFeatureColumnDefs = this.getTimeFeatureColumnDefs.bind(this);
    this.getTimeFeatureRowData = this.getTimeFeatureRowData.bind(this);
  }

  /**
   * The componentDidUpdate function
   *
   * @param {FeatureInfoGridProps} prevProps Previous props.
   * @param {FeatureInfoGridState} prevState Previous state.
   */
  componentDidUpdate(prevProps: FeatureInfoGridProps, prevState: FeatureInfoGridState) {
    const {
      features
    } = this.props;

    const {
      selectedFeat
    } = this.state;

    if (!isEqual(prevProps.features, features)) {
      features[0].set('selectedFeat', true);
      this.setState({
        selectedFeat: features[0],
        currentPage: 1
      });
    }
    if (!isEqual(prevState.selectedFeat, selectedFeat)) {
      this.updateVectorLayer(selectedFeat);
    }
  }

  /**
   * Updates hover vector layer with currently shown feature in grid.
   *
   * @param {OlFeature} newFeat Feature to update.
   */
  updateVectorLayer(newFeat: any) {
    const {
      hoverVectorLayer
    } = this.props;
    const source = hoverVectorLayer.getSource();
    const oldRenderFeat = source.getFeatures().find(
      (f: any) => f.get('selectedFeat') === true);
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
  }

  /**
   * Generates HTML link for attributes which value refers to external URL,
   * returns original attribute value otherwise.
   *
   * @param {String} text Attribute value
   * @return {ReactElement|String} Hyperlink element or original attribute value
   */
  getColumnText(text: any): string|React.ReactElement {
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
   * Filters feature properties and returns prepared row data for the grid.
   * @param {OlFeature} feat Feature which properties should be shown in grid.
   * @return {Array} Data array.
   */
  getRowData(feat: any): any[] {
    const rowData: any[] = [];
    const featProps = feat.getProperties();
    Object.keys(featProps).forEach(propKey => {
      const prop = featProps[propKey];
      if (prop instanceof OlGeomGeometry || (typeof prop !== 'string' && typeof prop !== 'number')) {
        return;
      }
      if (propKey === 'layerName') {
        return;
      }
      rowData.push({
        id: uniqueId('propId-'),
        attr: propKey,
        val: featProps[propKey]
      });
    });
    return rowData;
  }

  /**
   * Filters time-based feature properties and returns prepared row data for
   * the grid.
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

    filterFeatures.forEach(filterFeature => {
      const colData = {};
      Object.keys(filterFeature.getProperties()).forEach(propKey => {
        const prop = filterFeature.get(propKey);
        if (
          prop instanceof OlGeomGeometry ||
          (typeof prop !== 'string' && typeof prop !== 'number')
        ) {
          return;
        }
        if (propKey === 'layerName') {
          return;
        }
        colData[propKey] = filterFeature.get(propKey);
      });
      rowData.push(colData);
    });
    return rowData;
  }

  /**
   * Returns `AgFeatureGrid` component for provided feature.
   *
   * @param {OlFeature} feat OlFeature which properties should be shown in grid.
   */
  getFeatureGrid(feat: any): React.ReactElement {

    const defaultColDef = {
      sortable: true,
      resizable: true
    };

    const {
      isTimeLayer
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
        onGridIsReady={this.updateSize}
        onGridSizeChanged={this.updateSize}
        defaultColDef={defaultColDef}
        suppressHorizontalScroll={true}
        rowData={
          isTimeLayer ? this.getTimeFeatureRowData(feat) : this.getRowData(feat)
        }
        selectable={false}
      />
    );
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
