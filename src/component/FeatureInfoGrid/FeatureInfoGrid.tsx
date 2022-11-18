import React, { useEffect, useState } from 'react';
import i18n from '../../i18n';

import OlMap from 'ol/Map';
import OlFeature from 'ol/Feature';
import OlGeomGeometry from 'ol/geom/Geometry';
import OlLayerVector from 'ol/layer/Vector';
import OlSourceVector from 'ol/source/Vector';

import {
  Pagination
} from 'antd';

import AgFeatureGrid, { AgFeatureGridProps } from '@terrestris/react-geo/dist/Grid/AgFeatureGrid/AgFeatureGrid';
import { GridApi, CsvExportModule, DetailGridInfo } from 'ag-grid-community';
import { MapUtil } from '@terrestris/ol-util/dist/MapUtil/MapUtil';

import './FeatureInfoGrid.css';

import _isEqual from 'lodash/isEqual';
import _isEmpty from 'lodash/isEmpty';
import _uniqueId from 'lodash/uniqueId';
import _upperFirst from 'lodash/upperFirst';

interface DefaultFeatureInfoGridProps {
}

interface FeatureInfoGridProps {
  features: OlFeature<OlGeomGeometry>[];
  map: OlMap;
  hoverVectorLayer: OlLayerVector<OlSourceVector<OlGeomGeometry>>;
  isTimeLayer?: boolean;
  downloadGridData: boolean;
  onPaginationChange?: (idx: number) => void;
  t: (arg: any) => string;
  enableColumnFilter?: boolean;
  onGridIsReadyCallback?: (arg: AgFeatureGridProps) => void;
}

interface ColumnDef {
  headerName: string;
  field: string;
  minWidth: number;
  filter?: boolean;
  cellRenderer?: (text: string) => string | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
}

interface RowData {
  id?: number | string;
  attr?: string;
  val?: string;
}

export type ComponentProps = DefaultFeatureInfoGridProps & FeatureInfoGridProps;

let gridApi: GridApi;

/**
 * Class representing a feature info grid.
 *
 * @class The FeatureInfoGrid.
 * @extends React.Component
 */
export const FeatureInfoGrid: React.FC<ComponentProps> = ({
  downloadGridData,
  features,
  hoverVectorLayer,
  isTimeLayer = false,
  map,
  onPaginationChange,
  t,
  enableColumnFilter,
  onGridIsReadyCallback
}): React.ReactElement => {

  const [selectedFeat, setSelectedFeat] = useState<OlFeature<OlGeomGeometry>>(features[0]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {

    if (!features[0]) {
      return;
    }

    features[0].set('selectedFeat', true);
    setSelectedFeat(features[0]);
    setCurrentPage(1);
  }, [features]);

  useEffect(() => {
    updateVectorLayer(selectedFeat);
  }, [selectedFeat]);

  useEffect(() => {
    if (downloadGridData) {
      downloadData();
    }
  }, [downloadGridData]);

  /**
   * Updates hover vector layer with currently shown feature in grid.
   *
   * @param {OlFeature} newFeat Feature to update.
   */
  const updateVectorLayer = (newFeat: OlFeature<OlGeomGeometry>): void => {
    const source = hoverVectorLayer.getSource();
    const oldRenderFeat: OlFeature<OlGeomGeometry> = source.getFeatures().find(
      (f: OlFeature<OlGeomGeometry>) => f.get('selectedFeat') === true);
    if (oldRenderFeat) {
      source.removeFeature(oldRenderFeat);
    }
    source.addFeature(newFeat.clone());
  };

  /**
   * Updates feature grid on pagination change.
   *
   * @param {Number} newIdx
   */
  const onChangedPagination = (newIdx: number) => {
    const newSelectedFeat = features[newIdx - 1];
    newSelectedFeat.set('selectedFeat', true);
    setSelectedFeat(newSelectedFeat);
    setCurrentPage(newIdx);
    if (onPaginationChange) {
      onPaginationChange(newIdx);
    }
  };

  /**
   * Generates HTML link for attributes which value refers to external URL,
   * returns original attribute value otherwise.
   *
   * @param {String} text Attribute value
   * @return {ReactElement|String} Hyperlink element or original attribute value
   */
  const getColumnText = (text: any): string | React.ReactElement => {
    const colText: string = text.value;
    if (colText && colText.toString().toLowerCase().indexOf('http') > -1) {
      return `<a class="link" href=${colText} target='_blank'>Link</a>`;
    }
    return colText;
  };

  /**
   * Returns column definition for feature grid.
   */
  const getColumnDefs = (): ColumnDef[] => {
    // feature attribute grid has two columns (NAME/VALUE) which are
    // always the same for all feature types.
    return [{
      headerName: t('FeatureInfoGrid.gfiAttributeNameColumnText'),
      field: 'attr',
      minWidth: 100,
      filter: enableColumnFilter === true ? true : false
    }, {
      headerName: t('FeatureInfoGrid.gfiAttributeValueColumnText'),
      field: 'val',
      minWidth: 200,
      cellRenderer: (text: string) => getColumnText(text),
      filter: enableColumnFilter === true ? true : false
    }];
  };

  /**
   * Returns column definition for feature grid of time interval based
   * features.
   */
  const getTimeFeatureColumnDefs = (): ColumnDef[] => {
    const columnDefs: ColumnDef[] = [];

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
        filter: enableColumnFilter === true ? true : false,
        minWidth: 100
      });
    });

    return columnDefs;
  };

  /**
   * Prepare attribute configuration by filtering of some special non string based
   * values (e.g. geometry). Also consider possibly configured visible attribute
   * configuration set on certain layer.
   */
  const getDisplayedAttributeConfiguration = (feat: OlFeature<OlGeomGeometry>) => {
    const featProps = feat.getProperties();
    let propKeys = Object.keys(featProps);
    const layerName = feat.get('layerName');
    const layer = MapUtil.getLayerByNameParam(map, layerName);
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
  };

  /**
   * Returns prepared row data for the grid.
   * @param {OlFeature} feat Feature which properties should be shown in grid.
   * @return {Array} Data array.
   */
  const getRowData = (feat: OlFeature<OlGeomGeometry>): RowData[] => {
    const rowData: RowData[] = [];
    const featProps = feat.getProperties();
    const {
      propKeys,
      attrAliases
    } = getDisplayedAttributeConfiguration(feat);

    propKeys.forEach((propKey: string) => {
      rowData.push({
        id: _uniqueId('propId-'),
        attr: attrAliases && attrAliases[propKey] ? attrAliases[propKey] : propKey,
        val: featProps[propKey]
      });
    });
    return rowData;
  };

  /**
 * Returns prepared row data for the grid for all time-based features.
 * @param {OlFeature} feat Feature whose time-based properties should be
 * displayed in the grid.
 * @return {Array} Data array.
 */
  const getTimeFeatureRowData = (feat: OlFeature<OlGeomGeometry>): RowData[] => {

    const rowData: RowData[] = [];
    const featureLayerName: string = feat.get('layerName');
    const filterFeatures: OlFeature<OlGeomGeometry>[] = features.filter(f => {
      return f.get('layerName') === featureLayerName;
    });

    filterFeatures.forEach((filterFeature: OlFeature<OlGeomGeometry>) => {
      let colData: RowData = {};
      const {
        propKeys
      } = getDisplayedAttributeConfiguration(filterFeature);
      propKeys.forEach((propKey: string) => {
        colData[propKey] = filterFeature.get(propKey);
      });
      rowData.push(colData);
    });
    return rowData;
  };

  /**
   * Provides a function to download the grid data.
   * Only active when time-based layer is selected for FeatureRequest.
   */
  const downloadData = () => {
    if (Object.keys(gridApi).length) {
      const detailedGrids: DetailGridInfo[] = [];
      gridApi.forEachDetailGridInfo((grid: DetailGridInfo) => detailedGrids.push(grid));
      if (detailedGrids.length) {
        detailedGrids.forEach(grid => grid.api.exportDataAsCsv());
      }
    }
  };

  /**
   * Returns `AgFeatureGrid` component for provided feature.
   *
   * @param {OlFeature} feat OlFeature which properties should be shown in grid.
   */
  const getFeatureGrid = (feat: OlFeature<OlGeomGeometry>): React.ReactElement => {

    const defaultColDef = {
      sortable: true,
      resizable: true,
      wrapText: true,
      autoHeight: true,
      cellClass: 'cell-wrap-text'
    };

    return (
      <AgFeatureGrid
        map={map}
        onRowClick={() => undefined as any}
        width={'auto'}
        className="grid-content"
        height={'auto'}
        columnDefs={isTimeLayer ? getTimeFeatureColumnDefs() : getColumnDefs()}
        onGridIsReady={onGridIsReady}
        onGridSizeChanged={updateSize}
        defaultColDef={defaultColDef}
        suppressHorizontalScroll={true}
        rowData={isTimeLayer ? getTimeFeatureRowData(feat) : getRowData(feat)}
        selectable={false}
        localeText={{
          noRowsToShow: t('FeatureInfoGrid.noDataFoundText')
        }}
        modules={[CsvExportModule]}
      />
    );
  };

  /**
   * Will be executed, when the grid is ready.
   */
  const onGridIsReady = (featureGrid: AgFeatureGridProps): void => {
    const id = _uniqueId();
    const gridInfo = {
      id: id,
      api: featureGrid.api,
      columnApi: featureGrid.columnApi,
    };

    updateSize(featureGrid);

    if (!gridApi) {
      gridApi = featureGrid.api;
    }

    gridApi.addDetailGridInfo(id, gridInfo);

    if (onGridIsReadyCallback) {
      onGridIsReadyCallback(featureGrid);
    }
  };

  /**
   * Calls sizeColumnsToFit to fit the columns into available width.
   */
  const updateSize = (featureGrid: any): void => {
    featureGrid.api.sizeColumnsToFit();
  };

  return (
    <div className='feature-grid-wrapper'>
      {
        !isTimeLayer && features.length > 0 &&
        <Pagination
          key="pagination"
          simple={true}
          hideOnSinglePage={true}
          size="small"
          current={currentPage}
          defaultCurrent={1}
          total={features.length}
          pageSize={1}
          onChange={onChangedPagination}
        />
      }
      {getFeatureGrid(selectedFeat)}
    </div>
  );
};

export default FeatureInfoGrid;
