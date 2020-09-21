import * as React from 'react';
import OlGeomGeometry from 'ol/geom/Geometry';

import {
  Pagination
} from 'antd';

import AgFeatureGrid from '@terrestris/react-geo/dist/Grid/AgFeatureGrid/AgFeatureGrid';

import './FeatureInfoGrid.less';

const _uniqueId = require('lodash/uniqueId');
const _isEqual = require('lodash/isEqual');

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
   * Filters feature properties and returns prepared row data for the grid.
   * @param {OlFeature} feat Feature which properties should be shown in grid.
   * @return {Array} Data array.
   */
  getRowData(feat: any): any[] {
    let rowData: any[] = [];
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
        id: _uniqueId('propId-'),
        attr: propKey,
        val: featProps[propKey]
      });
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

    return (
      <AgFeatureGrid
        map={null}
        width={'auto'}
        className="grid-content"
        height={'auto'}
        columnDefs={this.getColumnDefs()}
        onGridIsReady={this.updateSize}
        onGridSizeChanged={this.updateSize}
        defaultColDef={defaultColDef}
        suppressHorizontalScroll={true}
        rowData={this.getRowData(feat)}
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
      features
    } = this.props;

    const {
      currentPage,
      selectedFeat
    } = this.state;

    return (
      <div className='feature-grid-wrapper'>
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
        {this.getFeatureGrid(selectedFeat)}
      </div>

    );
  }
}

export default FeatureInfoGrid;
