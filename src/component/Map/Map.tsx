import * as React from 'react';
import { connect } from 'react-redux';

import MapComponent, { MapComponentProps } from '@terrestris/react-geo/dist/Map/MapComponent/MapComponent';

const isEqual = require('lodash/isEqual');
const debounce = require('lodash/debounce');

import { setZoom, setCenter, setProjection } from '../../state/actions/MapViewChangeAction';

/**
 * mapStateToProps - mapping state to props of Map Component.
 *
 * @param {Object} state current state
 * @return {Object} mapped props
 */
const mapStateToProps = (state: any) => {

  let presentMapView = state.mapView.present;

  return {
    center: presentMapView.center,
    zoom: presentMapView.zoom,
    projection: presentMapView.projection,
    mapLayers: state.mapLayers
  };
};

interface DefaultMapProps extends MapComponentProps {
  firePointerRest: boolean,
  pointerRestInterval: number,
  pointerRestTolerance: number
}

interface MapProps extends Partial<DefaultMapProps> {
  map: any, //OlMap
  dispatch: (arg: any) => void,
  center: number[],
  zoom: number,
  mapLayers: any[]
  projection: string
}

interface MapState {
  lastPointerPixel: number[] | null,
  isMouseOverMapEl: boolean
}

/**
 * Class representing a map.
 *
 * @class The Map.
 * @extends React.Component
 */
export class Map extends React.Component<MapProps, MapState> {

  /**
   *
   */
  private debouncedCheckPointerRest: Function | null;

  /**
   * The default properties.
   */
  public static defaultProps: DefaultMapProps = {
    map: null,
    firePointerRest: true,
    pointerRestInterval: 500,
    pointerRestTolerance: 3
  };

  /**
   * Create a map.
   * @constructs Map
   */
  constructor(props: MapProps) {
    super(props);

    this.debouncedCheckPointerRest = null;

    // binds
    this.onMapMoveEnd = this.onMapMoveEnd.bind(this);
    this.onMapViewChange = this.onMapViewChange.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.checkPointerRest = this.checkPointerRest.bind(this);
  }

  /**
   * The componentDidMount function
   *
   * After the component did mount, the map is set up
   *  * Add layers
   *  * Define and set view
   *  * ...
   *
   * @method componentDidMount
   */
  componentDidMount() {
    // register ol-listener to handle user-initiated prop updates
    const map = this.props.map;
    map.setTarget('map');
    map.on('moveend', this.onMapMoveEnd, this);
    map.on('change:view', this.onMapViewChange, this);

    this.initDebouncedCheckPointerRest(this.props.pointerRestInterval);
    this.setFirePointerRest(this.props.firePointerRest);
  }

  /**
   * The componentDidUpdate function
   *
   * @param {MapProps} prevProps Previous props.
   *
   * @method componentWillReceiveProps
   */
  componentDidUpdate(prevProps: MapProps) {
    const {
      firePointerRest
    } = this.props;

    if (!isEqual(firePointerRest, prevProps.firePointerRest)) {
      this.setFirePointerRest(firePointerRest);
    }
  }

  /**
   * (Un-)Registers the debouncedCheckPointerRest method on `pointermove`.
   *
   * @param {Boolean} state Whether to enable or disable the listener.
   */
  setFirePointerRest(state: boolean|undefined) {
    if (state) {
      this.props.map.on('pointermove', this.debouncedCheckPointerRest);
    } else {
      this.props.map.un('pointermove', this.debouncedCheckPointerRest);
    }
  }

  /**
   * Initializes the debounced checkPointerRest method.
   *
   * @param {interval} interval The debounce interval to use.
   */
  initDebouncedCheckPointerRest(interval: any) {
    if (!this.debouncedCheckPointerRest) {
      this.debouncedCheckPointerRest = debounce(
        this.checkPointerRest,
        interval
      );
    }
  }

  /**
   * Will be called if the mouse/pointer is over the map div.
   */
  onMouseOver() {
    this.setState({
      isMouseOverMapEl: true
    });
  }

  /**
   * Will be called if the mouse/pointer is moved outside the map div.
   */
  onMouseOut() {
    this.setState({
      isMouseOverMapEl: false
    });
  }

  /**
   * Fires the `pointerrest` event if the mouse lasts on the current coordinate.
   * Typically used in a debounced context (see debouncedCheckPointerRest) to
   * check in a given interval.
   *
   * @param {ol.event} olEvt The ol event.
   */
  checkPointerRest(olEvt: any) {
    if (olEvt.dragging || !this.state.isMouseOverMapEl ||
        !(olEvt.target.getRenderer().canvas_)) {
      return;
    }

    let pixel = olEvt.pixel;
    let tolerance = this.props.pointerRestTolerance;

    let lastPointerPixel = this.state.lastPointerPixel;

    if (lastPointerPixel) {
      let deltaX = Math.abs(lastPointerPixel[0] - pixel[0]);
      let deltaY = Math.abs(lastPointerPixel[1] - pixel[1]);

      if (deltaX > tolerance || deltaY > tolerance) {
        this.setState({
          lastPointerPixel: pixel
        });
      } else {
        return;
      }
    } else {
      this.setState({
        lastPointerPixel: pixel
      });
    }

    this.props.map.dispatchEvent({
      ...olEvt,
      type: 'pointerrest'
    });
  }

  /**
   * Sets updated center and zoom mapView attributes globally in state after
   * map was moved.
   *
   */
  onMapMoveEnd() {
    const {
      map,
      center,
      zoom,
      dispatch
    } = this.props;
    const mapView = map.getView();
    const mapCenter = mapView.getCenter();
    const mapZoom = mapView.getZoom();

    if ((zoom && zoom !== mapZoom) ||
        (center && !isEqual(center, mapCenter))) {
        dispatch(setCenter(mapView.getCenter()));
        dispatch(setZoom(mapView.getZoom()));
    }
  }

  /**
   * Sets updated map CRS globally in state after mapView was changed.
   *
   * @param {Event} evt mapView change event containing updated map.
   */
  onMapViewChange(evt: any) {
    const {
      map,
      dispatch
    } = this.props;
    const mapView = map.getView();
    const projection = mapView.getProjection().getCode();

    dispatch(setProjection(projection));
  }

  /**
   * The render function.
   */
  render() {
    const {
      map,
      firePointerRest
    } = this.props;

    return (
      <MapComponent
        map={map}
        onMouseOver={firePointerRest ? this.onMouseOver : undefined}
        onMouseOut={firePointerRest ? this.onMouseOut : undefined}
      >
        {this.props.children}
      </MapComponent>
    );
  }
}

export default connect(mapStateToProps)(Map);
