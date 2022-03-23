import * as React from 'react';
import { connect } from 'react-redux';

import MapComponent, { MapComponentProps } from '@terrestris/react-geo/dist/Map/MapComponent/MapComponent';
import OlMap from 'ol/Map';

const isEqual = require('lodash/isEqual');
const debounce = require('lodash/debounce');

import { setZoom, setCenter, setProjection } from '../../state/mapView';

/**
 * mapStateToProps - mapping state to props of Map Component.
 *
 * @param {Object} state current state
 * @return {Object} mapped props
 */
const mapStateToProps = (state: any) => {

  const presentMapView = state.mapView.present;

  return {
    center: presentMapView.center,
    zoom: presentMapView.zoom,
    projection: presentMapView.projection,
    mapLayers: state.mapLayers
  };
};

interface DefaultMapProps extends Omit<MapComponentProps, 'map'> {
  firePointerRest: boolean;
  pointerRestInterval: number;
  pointerRestTolerance: number;
}

interface OwnMapProps extends Partial<DefaultMapProps> {
  map: OlMap;
  dispatch: (arg: any) => void;
  center: number[];
  zoom: number;
  mapLayers: any[];
  projection: string;
  children?: any;
}

declare type MapProps =  DefaultMapProps & OwnMapProps;

interface MapState {
  lastPointerPixel: number[] | null;
  isMouseOverMapEl: boolean;
  mouseEvt: MouseEvent;
}

/**
 * Class representing a map.
 *
 * @class The Map.
 * @extends React.Component
 */
export class Map extends React.Component<MapProps, MapState> {

  /**
  * The default properties.
  */
  public static defaultProps: DefaultMapProps = {
    firePointerRest: true,
    pointerRestInterval: 500,
    pointerRestTolerance: 3
  };

  /**
   *
   */
  private debouncedCheckPointerRest: () => void;

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
    this.trackMousePosition = this.trackMousePosition.bind(this);
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
    map.on('moveend', this.onMapMoveEnd);
    map.on('change:view', this.onMapViewChange);

    this.initDebouncedCheckPointerRest(this.props.pointerRestInterval);
    this.setFirePointerRest(this.props.firePointerRest);
    document.addEventListener('mousemove', this.trackMousePosition);
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
   * Called on lifecycle componentWillUnmount.
   */
  componentWillUnmount() {
    const map = this.props.map;
    map.un('moveend', this.onMapMoveEnd);
    map.un('change:view', this.onMapViewChange);
    document.removeEventListener('mousemove', this.trackMousePosition);
  }

  /**
   * Track mouse position for comparison purposes
   */
  trackMousePosition(evt: MouseEvent) {
    this.setState({
      mouseEvt: evt
    });
  }

  /**
   * (Un-)Registers the debouncedCheckPointerRest method on `pointermove`.
   *
   * @param {Boolean} state Whether to enable or disable the listener.
   */
  setFirePointerRest(state: boolean | undefined) {
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
      !(olEvt.originalEvent.target.tagName.toLowerCase() === 'canvas' ||
      olEvt.originalEvent.target.className === 'ol-layer')) {
      return;
    }

    const pixel = olEvt.pixel;
    const tolerance = this.props.pointerRestTolerance;

    const lastPointerPixel = this.state.lastPointerPixel;

    if (lastPointerPixel) {
      const deltaX = Math.abs(lastPointerPixel[0] - pixel[0]);
      const deltaY = Math.abs(lastPointerPixel[1] - pixel[1]);

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
   */
  onMapViewChange() {
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
