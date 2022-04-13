import * as React from 'react';
import { connect } from 'react-redux';

import './Footer.css';

import {
  get as getProjection,
  getTransform
} from 'ol/proj.js';
import { applyTransform } from 'ol/extent.js';
import { createStringXY } from 'ol/coordinate.js';
import OlView from 'ol/View';
import OlMap from 'ol/Map';
import OlMousePositionControl from 'ol/control/MousePosition';
// eslint-disable-next-line
import CoordinateReferenceSystemCombo from '@terrestris/react-geo/dist/Field/CoordinateReferenceSystemCombo/CoordinateReferenceSystemCombo';
import ScaleCombo from '@terrestris/react-geo/dist/Field/ScaleCombo/ScaleCombo';

import ProjectionUtil from '@terrestris/ol-util/dist/ProjectionUtil/ProjectionUtil';
import MapUtil from '@terrestris/ol-util/dist/MapUtil/MapUtil';
import { BaseClientState } from '../../../state/reducer';

// default props
interface DefaultFooterProps {
  className: string;
  imprint: string;
}

interface FooterProps extends Partial<DefaultFooterProps> {
  map: OlMap;
  t: (arg: string) => {};
  mapScales: number[];
  projection: string;
  version?: string;
}

interface FooterState {
}

/**
 * mapStateToProps - mapping state to props of Map Component.
 *
 * @param {Object} state current state
 * @return {Object} mapped props
 */
const mapStateToProps = (state: BaseClientState) => {
  return {
    projection: state.mapView.projection
  };
};

/**
 * Class representing the Footer.
 *
 * @class Footer
 * @extends React.Component
 */
export class Footer extends React.Component<FooterProps, FooterState> {

  private footerMousePositionControlName = 'react-geo-baseclient-mouse-position';

  private predefinedCrsDefinitions = [{
    // When adding new CRS, please note:
    // Make sure that tile grids for new CRS are created
    // cf. function parseTileLayer in class Shogun2AppContextUtil
    code: '4326',
    value: 'WGS 84'
  }, {
    code: '3857',
    value: 'Pseudo-Mercator'
  }];

  /**
   * Create the Footer.
   *
   * @constructs Footer
   */
  constructor(props: FooterProps) {
    super(props);
    this.setProjection = this.setProjection.bind(this);
  }

  /**
   * Is invoked before a mounted component receives new props.
   *
   * @param {Object} nextProps The next props.
   */
  componentDidMount() {
    const {
      map
    } = this.props;
    if (map) {
      this.createOlMousePositionControl(map);
    }
  }

  /**
   * Is invoked if component is unmounted from DOM
   */
  componentWillUnmount() {
    const {
      map
    } = this.props;
    if (map) {
      this.removeOlMousePositionControl(map);
    }
  }

  /**
   * Creates and adds the mouse position control to the map.
   *
   * @param {OlMap} The OpenLayers map
   */
  createOlMousePositionControl = (map: OlMap) => {
    const existingControls = map.getControls();
    const mousePositionControl = existingControls.getArray()
      .find((c) => c instanceof OlMousePositionControl);
    const projection = map.getView().getProjection().getCode();

    if (!mousePositionControl) {
      const options = {
        name: this.footerMousePositionControlName,
        coordinateFormat: createStringXY(2),
        target: document.getElementById('mouse-position'),
        undefinedHTML: '&nbsp;',
        projection
      };
      const mousePositionCtrl = new OlMousePositionControl(options);
      map.addControl(mousePositionCtrl);
    }
  };

  /**
   * Removes mouse position control from map
   *
   * @param {OlMap} The OpenLayers map
   */
  removeOlMousePositionControl = (map: OlMap) => {
    if (!map) {
      return;
    }
    const mousePositionControls = map.getControls().getArray()
      .filter((c) => c instanceof OlMousePositionControl);
    if (!mousePositionControls) {
      return;
    }
    const crtlToRemove = mousePositionControls.find((ctrl) =>
      ctrl.get('name') === this.footerMousePositionControlName);
    if (crtlToRemove) {
      map.removeControl(crtlToRemove);
    }
  };

  /**
   * Handler to set projection of map - called if coordinate system in
   * CoordinateReferenceSystemCombo was changed
   *
   * @param {Object} crsObj The object returned by CoordinateReferenceSystemCombo
   *
   */
  setProjection(crsObj: any) {
    const {
      map,
      mapScales
    } = this.props;
    const currentProjection = map.getView().getProjection();
    const newProj = getProjection(`EPSG:${crsObj.code}`);
    const fromToTransform = getTransform(currentProjection, newProj);
    const currentExtent = map.getView().calculateExtent(map.getSize());

    const transformedExtent = applyTransform(currentExtent, fromToTransform);
    const resolutions = mapScales
      .map((scale: number) =>
        MapUtil.getResolutionForScale(scale, newProj.getUnits()))
      .reverse();
    const newView = new OlView({
      projection: newProj,
      resolutions: resolutions,
      constrainOnlyCenter: true,
      constrainResolution: true
    });
    map.setView(newView);
    newView.fit(transformedExtent);

    const mousePositionControl = (map.getControls().getArray()
      .find((c) => c instanceof OlMousePositionControl)) as OlMousePositionControl;

    if (mousePositionControl) {
      const isWgs84 = map.getView().getProjection().getCode() === 'EPSG:4326';
      const wgs84Format = (coordinate: any) => coordinate.map((coord: number) => ProjectionUtil.toDms(coord));
      mousePositionControl.setProjection(newProj);
      mousePositionControl.setCoordinateFormat(isWgs84 ? wgs84Format : createStringXY(2));
    }
  }

  /**
   * The render function
   */
  render() {
    const {
      className,
      map,
      mapScales,
      projection,
      imprint,
      version,
      t
    } = this.props;

    return (
      <footer className={`footer ${className}`}>
        <div className="crscombo-col footer-element">
          <span>{t('CoordinateReferenceSystemCombo.label')}</span>
          <CoordinateReferenceSystemCombo
            allowClear={false}
            dropdownClassName="crs-dropdown"
            predefinedCrsDefinitions={this.predefinedCrsDefinitions}
            onSelect={this.setProjection}
            emptyTextPlaceholderText={t('CoordinateReferenceSystemCombo.emptyTextPlaceholderText') as string}
            value={projection.replace('EPSG:', '')}
          />
        </div>
        <div className="scalecombo-col footer-element">
          <span>{t('ScaleComboLabel')}</span>
          <ScaleCombo
            className="scalecombo"
            map={map}
            scales={mapScales}
          />
        </div>
        <div className="ol-mouse-position footer-element">
          <span>{t('MousePositionLabel')}: </span>
          <div id="mouse-position"/>
        </div>
        {version && <div className="version_number">
          <span>{t('Version')}: {version}</span>
        </div>}
        <div className="imprint footer-element">
          {imprint ?
            <div dangerouslySetInnerHTML={{ __html: imprint }} /> :
            <a href="https://www.terrestris.de/de/impressum">
              {`${t('Imprint.title')} / ${t('Imprint.privacypolicy')}`}
            </a>
          }
        </div>
      </footer>
    );
  }
}

export default connect(mapStateToProps)(Footer);
