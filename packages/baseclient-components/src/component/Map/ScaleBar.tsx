import * as React from 'react';
import { getDistance } from 'ol/sphere';
import { transform } from 'ol/proj';
import './ScaleBar.less';
import MapUtil from '@terrestris/ol-util/src/MapUtil/MapUtil';

/**
 * Class representing a ScaleBar.
 * Currently, only metric projections are supported
 */

// default props
interface DefaultScaleBarProps {
    /**
     * The openlayers map.
     *
     * @type {OlMap}
     */
    map: any,

    /**
     * The number of steps.
     * Should be an even number for best results
     */
    steps: number,

    /**
     * The approximate width of the scaleBar.
     * Width will change slightly in order to be able to show nice
     * scale values
     */
    width: number,

    /**
     * The asbolute position from bottom in pixels
     */
    bottom: number,

    /**
     * The asbolute position from left in pixels
     */
    left: number
}

/**
 * @class The ScaleBar.
 * @extends React.Component
 */
export default class ScaleBar extends React.Component<DefaultScaleBarProps> {

  /**
   * The default properties.
   * @type {Object}
   */
  static defaultProps = {
    steps: 4,
    width: 300,
    bottom: 50,
    left: 10
  }

  /**
   * Create a ScaleBar.
   * @constructs ScaleBar
   */
  constructor(props: DefaultScaleBarProps) {
    super(props);

    const proj = this.props.map.getView().getProjection();
    if (proj.getUnits() !== 'm') {
      throw new Error('Your map projection is not supported by the scalebar');
    }
    this.props.map.on('moveend', () => {
      this.setState({});
    })
  }

  /**
   * Creates the scalebar by iterating over the steps and creating the divs
   */
  createSteps = () => {
    const {
      steps,
      map
    } = this.props;

    // for now we set this fixed, CSS needs to be enhanced to support this
    const height = 15;

    const factor = this.getPrecisionFactor();
    const resolution = map.getView().getResolution() * factor;
    const widthToUse = this.getWidthToUse(resolution);

    let scaleSteps = [];
    const stepWidth = widthToUse / steps;
    let backgroundColor = '#ffffff';
    for (let i=0; i<steps; i++) {
      if (i === 0) {
        // create the first marker at position 0
        scaleSteps.push(this.createMarker('absolute', i));
      }
      scaleSteps.push(
        <div key={i + 100}>
          <div
            className="scale-bar"
            key={i}
            style={{
              width: stepWidth,
              height: height - 5,
              backgroundColor: backgroundColor
            }}
          >
          </div>
          {this.createMarker('relative', i)}
          {/*render text every second step */}
          {i % 2 === 0 ? this.createStepText(i, widthToUse, resolution, false) : null}
        </div>
      );
      if (i === steps - 1) {
        {/*render text at the end */}
        scaleSteps.push(this.createStepText(i + 1, widthToUse, resolution, true));
      }
      // switch colors of steps between black and white
      if (backgroundColor === '#ffffff') {
        backgroundColor = '#000000';
      } else {
        backgroundColor = '#ffffff';
      }
    }
    return(
      <div
        style={{
          display: 'flex'
        }}
      >
        {scaleSteps}
      </div>
    );
  }

  /**
   * Creates a marker at given position
   * @param {string} position - The position, absolute or relative
   * @param {number} i - The iterator
   */
  createMarker = (position: any, i: number) => {
    return (
      <div
        key={i + 200}
        className='step-marker'
        style={{
          position: position,
          top: position === 'absolute' ? 0 : -10
        }}
      >
      </div>
    );
  }

  /**
   * Creates the label for a marker marker at given position
   * @param {number} i - The iterator
   * @param {number} widthToUse - The width the scalebar will currently use
   * @param {number} resolution - The current resolution
   * @param {boolean} isLast - Flag indicating if we add the last step text
   */
  createStepText = (i: number, widthToUse: number, resolution: number, isLast: boolean) => {
    const {
      steps
    } = this.props;
    // we approximate the text length here for centered positioning over the step markers
    const lengthString = i === 0 ? "0" : this.formatLength(widthToUse / steps * resolution * i);
    const textLength = lengthString.length;
    return (
      <div key={i + 300}>
        <div
          className='step-text'
          style={{
            marginLeft: i === 0 ? -3 : -3 * textLength,
            bottom: isLast ? -15 : -5,
            width: isLast ? 100 : 'unset'
          }}
        >
          {lengthString}
        </div>
      </div>
    );
  }

  /**
   * Get the factor we need to use for precise measurements
   */
  getPrecisionFactor = () => {
    const {
      bottom,
      left,
      width,
      map
    } = this.props;
    // return if we are too early and map is not rendered yet
    if (!this.props.map.getSize()) {
      return false;
    }
    // we determine the rough position of the scalebars middlepoint
    const mapProj = map.getView().getProjection();
    // TODO: we should get rid of magic number 80, which has to be a result of non perfect CSS positioning
    // the middlepoint has to contain the y-position of the measure-labels to be most accurate
    const approximatedMiddlePointOfScaleBar = [left + width / 2, map.getSize()[1] - bottom - 80];
    const coord = map.getCoordinateFromPixel(approximatedMiddlePointOfScaleBar);
    if (coord === null) {
      return;
    }
    // we will now determine the resolution difference between OLs map.getView().getResolution()
    // and ol.sphere.getDistance() in order to gain same precision as the scaleline from OL
    const latLon = transform(coord, mapProj, 'EPSG:4326');
    const shiftedLatLon = transform([coord[0] + 1, coord[1]], mapProj, 'EPSG:4326');
    return getDistance(latLon, shiftedLatLon);
  }

  /**
   * Method determines the width to use for the scalebar
   * @param {number} resolution - The current resolution
   */
  getWidthToUse = (resolution: number) => {
    // we will do some Math.round() to get nice display values
    // which leads to a increasing and shrink size of the scaleBar
    const digits = Math.round(resolution).toString().length;
    const flattener = Math.pow(10, digits - 1);
    let niceResolution = Math.round(resolution / flattener) * flattener;
    if (niceResolution <= 0) {
      if (resolution > 0.5) {
        niceResolution = 1;
      } else if (resolution > 0.25) {
        niceResolution = 0.50;
      } else {
        niceResolution = 0.1;
      }
    }
    return this.props.width / resolution * niceResolution;
  }

  /**
   * Formats the given length for the step texts
   * @param {number} length - The measured length
   */
  formatLength = (length: number) => {
    // allow two decimals
    const decimalHelper = Math.pow(10, 2);
    if (length > 1000) {
      return(Math.round(length / 1000 * decimalHelper) /
        decimalHelper) + ' km';
    } else {
      return(Math.round(length * decimalHelper) / decimalHelper) +
        ' m';
    }
  }

  /**
   * Returns a formatted scale for given resolution
   * @param {OlMap} map - The map
   */
  getScale = (map: any) => {
    let scale = Math.round(MapUtil.getScaleForResolution(map.getView().getResolution(), 'm')).toString();
    scale = scale.toLocaleString().replace(/,/g,'.');
    scale = '1 : ' + scale;
    return scale;
  }

  /**
   * The render function.
   */
  render() {
    const {
      map,
      width,
      bottom,
      left
    } = this.props;

    const factor = this.getPrecisionFactor();
    // return if map was not ready
    if (!factor) {
      return null;
    }
    const resolution = map.getView().getResolution() * factor;
    const widthToUse = this.getWidthToUse(resolution);
    const scale = this.getScale(map);
    const steps = this.createSteps();

    return (
      <div
        className="scale-bar"
        style={{
          width: width,
          bottom: bottom,
          left: left
        }}
      >
        <div
          className="scale-text"
          style={{
            width: widthToUse,
            left: left
          }}
        >
          {scale}
        </div>
        {steps}
      </div>
    );
  }
}
