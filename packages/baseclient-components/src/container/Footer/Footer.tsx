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
import OlMap from 'ol/Map';
import OlMousePositionControl from 'ol/control/MousePosition';

import {
  CoordinateReferenceSystemCombo,
  ScaleCombo
} from '@terrestris/react-geo/';

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
   * Creates and adds the mouse position control to the map.
   */
  createOlMousePositionControl = (map: OlMap) => {
    const mousePositionControl = new OlMousePositionControl({
      coordinateFormat: createStringXY(2),
      projection: this.props.projection,
      target: document.getElementById('mouse-position'),
      undefinedHTML: '&nbsp;'
    });

    map.addControl(mousePositionControl);
  }

  /**
   *
   * @param crsObj
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
