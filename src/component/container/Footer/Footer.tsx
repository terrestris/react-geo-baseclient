import * as React from 'react';
import './Footer.less';

import {
  Row,
  Col
} from 'antd';
import {
  get as getProjection,
  getTransform
} from 'ol/proj.js';
import { applyTransform } from 'ol/extent.js';
import { createStringXY } from 'ol/coordinate.js';
import OlView from 'ol/View';
import OlMousePositionControl from 'ol/control/MousePosition';

import CoordinateReferenceSystemCombo from '@terrestris/react-geo/dist/Field/CoordinateReferenceSystemCombo/CoordinateReferenceSystemCombo';
import ScaleCombo from '@terrestris/react-geo/dist/Field/ScaleCombo/ScaleCombo';

// default props
interface DefaultFooterProps {
}

interface FooterProps extends Partial<DefaultFooterProps>{
  map: any,
  t: (arg: string) => {}
}

interface FooterState {
}

/**
 * Class representing the Footer.
 *
 * @class LegendContainer
 * @extends React.Component
 */
export default class Footer extends React.Component<FooterProps, FooterState> {

  private footerMousePositionControlName = 'react-geo-baseclient-mouse-position';

  private predefinedCrsDefinitions = [{
    code: '4326',
    value: 'WGS 84'
  }, {
    code: '3857',
    value: 'Pseudo-Mercator -- Spherical Mercator'
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
  createOlMousePositionControl = (map: any) => {
    const existingControls = map.getControls();
    const mousePositionControl = existingControls.getArray()
      .find((c: any) => c instanceof OlMousePositionControl);

    if (!mousePositionControl) {
      const options: any = {
        name: this.footerMousePositionControlName,
        coordinateFormat: createStringXY(2),
        projection: map.getView().getProjection().getCode(),
        target: document.getElementById('mouse-position'),
        undefinedHTML: '&nbsp;'
      }
      const mousePositionControl = new OlMousePositionControl(options);
      map.addControl(mousePositionControl);
    }
  }

  /**
   * Removes mouse position control from map
   *
   * @param {OlMap} The OpenLayers map
   */
  removeOlMousePositionControl = (map: any) => {
    if (!map) {
      return;
    }
    const mousePositionControls = map.getControls().getArray()
      .filter((c: any) => c instanceof OlMousePositionControl);
    if (!mousePositionControls) {
      return;
    }
    const crtlToRemove = mousePositionControls.find((ctrl: any) => ctrl.get('name') === this.footerMousePositionControlName);
    if (crtlToRemove) {
      map.removeControl(crtlToRemove);
    }
  }

  /**
   * Handler to set projection of map - called if coordinate system in
   * CoordinateReferenceSystemCombo was changed
   *
   * @param {Object} crsObj The object returned by CoordinateReferenceSystemCombo
   *
   */
  setProjection(crsObj: any) {
    const { map } = this.props;
    const currentProjection = map.getView().getProjection();
    const newProj = getProjection(`EPSG:${crsObj.code}`);
    const fromToTransform = getTransform(currentProjection, newProj);
    const currentExtent = map.getView().calculateExtent(map.getSize());

    var transformedExtent = applyTransform(currentExtent, fromToTransform);
    var newView = new OlView({
      projection: newProj
    });
    map.setView(newView);
    newView.fit(transformedExtent);

    const mousePositionControl = map.getControls().getArray().find((c: any) => c instanceof OlMousePositionControl);
    const isWgs84 = map.getView().getProjection().getCode() === "EPSG:4326";
    // TODO: Use ProjectionUtil.toDms if react geo was updated (in particular ol util dependency to v2.2.0 f.e.)
    const wgs84Format = createStringXY(6);
    // const wgs84Format = (coordinate: any) => coordinate.map((coord: number) => ProjectionUtil.toDms(coord));
    mousePositionControl.setCoordinateFormat(isWgs84 ? wgs84Format : createStringXY(2));
  }

  /**
   * The render function
   */
  render() {
    const {
      map,
      t
    } = this.props;

    return (
      <footer className="footer">
        <Row>
          <Col
            className="scalecombo-col footer-element"
            span={4}
          >
            <span>{t('ScaleComboLabel')}</span>
            <ScaleCombo
              className="scalecombo"
              map={map}
            />
          </Col>
          <Col
            className="crscombo-col footer-element"
            span={6}
          >
            <span>{t('CoordinateReferenceSystemCombo.label')}</span>
            <CoordinateReferenceSystemCombo
              predefinedCrsDefinitions={this.predefinedCrsDefinitions}
              onSelect={this.setProjection}
              emptyTextPlaceholderText={t('CoordinateReferenceSystemCombo.emptyTextPlaceholderText')}
            />
          </Col>
          <Col
            span={8}
            className="ol-mouse-position footer-element"
          >
            <span>{t('MousePositionLabel')}: </span>
            <div id="mouse-position"/>
          </Col>
          <Col span={2}>
            <div />
          </Col>
          <Col
            span={4}
            className="imprint footer-element"
          >
            <a>{t('Imprint.title')} / {t('Imprint.privacypolicy')}</a>
          </Col>
        </Row>
      </footer>
    );
  }
}
