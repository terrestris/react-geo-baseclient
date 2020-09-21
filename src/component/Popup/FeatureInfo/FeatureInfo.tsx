import * as React from 'react';
import OlOverlay from 'ol/Overlay';
const _isEqual = require('lodash/isEqual');

import './FeatureInfo.less';
import OverlayPositioning from 'ol/OverlayPositioning';

interface DefaultFeatureInfoProps {

  /**
   * The width of the popup.
   * @type {Number}
  */
  width: number;

  /**
   * Offsets in pixels used when positioning the overlay. The first element
   * in the array is the horizontal offset. A positive value shifts the
   * overlay right. The second element in the array is the vertical offset.
   * A positive value shifts the overlay down.
   * @type {Array}
   */
  offset: number[];

  /**
   * Whether event propagation to the map viewport should be stopped. If true
   * the overlay is placed in the same container as that of the controls
   * (CSS class name ol-overlaycontainer-stopevent); if false it is placed in
   * the container with CSS class name ol-overlaycontainer.
   * @type {Boolean}
   */
  stopEvent: boolean;

  /**
   * Whether the overlay is inserted first in the overlay container, or
   * appended. If the overlay is placed in the same container as that of the
   * controls (see the stopEvent option) you will probably set insertFirst to
   * true so the overlay is displayed below the controls.
   * @type {Boolean}
   */
  insertFirst: boolean;

  /**
   * If set to true the map is panned when calling setPosition, so that the
   * overlay is entirely visible in the current viewport.
   * @type {Boolean}
   */
  autoPan: boolean;

  /**
   * The animation options used to pan the overlay into view. This animation
   * is only used when autoPan is enabled. A duration and easing may be
   * provided to customize the animation.
   * @type {Object}
   */
  autoPanAnimation: any;

  /**
   * The margin (in pixels) between the overlay and the borders of the map
   * when autopanning.
   * @type {Number}
   */
  autoPanMargin: number;
}

interface FeatureInfoProps extends Partial<DefaultFeatureInfoProps> {

  /**
   * The map this popup/overlay should be bound to.
   * @type {OlMap}
   */
  map: any; // OlMap

  /**
   * The overlay position in map projection.
   * @type {Array}
   */
  position: number[];

  /**
   * Defines how the overlay is actually positioned with respect to its
   * position property. Possible values are 'bottom-left', 'bottom-center',
   * 'bottom-right', 'center-left', 'center-center', 'center-right',
   * 'top-left', 'top-center', and 'top-right'.
   * @type {String}
   */
  positioning: OverlayPositioning;

  /**
   * Whether the component is loading (and should render a progress cursor)
   * or not.
   * @type {Boolean}
   */
  isLoading: boolean;

  /**
   * The children elements to render inside the popup.
   * @type {Element}
   */
  children: any;
}

interface FeatureInfoState {
  /**
   * The overlay position in map projection.
   * @type {Array}
   */
  position: number[];
}

/**
 * The FeatureInfoPopup component.
 *
 * @class FeatureInfo.
 * @extends React.Component
 */
export class FeatureInfo extends React.Component<FeatureInfoProps, FeatureInfoState> {

  /**
   * The root div node rendered inside this component. Will be filled
   * in ref callback and be used as HTML element for the OlOverlay.
   * @type {Element}
   */
  private overlayElement: any = null;

  /**
   * An invisible, non-disruptive element, that will be used to calculate the
   * height of the children of this component.
   * @type {Element}
   */
  private overlayHelperElement: any = null;

  /**
   * Feature info overlay element.
   * @type {OlOverlay}
   */
  private featureInfoOverlay: any = null;

  /**
   * Reference to feature info popup
   * @type {HTMLDivElement}
   */
  private featureInfoPopup: React.RefObject<HTMLDivElement>;

  /**
   * The default properties.
   */
  public static defaultProps: DefaultFeatureInfoProps = {
    width: 200,
    offset: [0, 0],
    stopEvent: false,
    insertFirst: true,
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    },
    autoPanMargin: 20
  };

  /**
   * The constructor.
   *
   * @param {FeatureInfoProps} props The initial props.
   */
  constructor(props: FeatureInfoProps) {
    super(props);

    this.featureInfoPopup = React.createRef();

    this.state = {
      position: props.position
    };

    // binds
    this.onMapClick = this.onMapClick.bind(this);
  }

  /**
   * Called on lifecycle componentDidMount.
   */
  componentDidMount() {
    this.mountOverlayHelperElement();
    this.setOverlayElement(this.featureInfoPopup.current);
    this.updatePopupPosition();
    this.createOverlay();
    this.props.map.addOverlay(this.featureInfoOverlay);
    this.props.map.on('click', this.onMapClick);
  }

  /**
   *
   */
  componentDidUpdate(prevProps: FeatureInfoProps, prevState: FeatureInfoState) {

    const {
      position,
      positioning
    } = this.props;

    if (prevProps.positioning !== positioning) {
      this.featureInfoOverlay.setPositioning(positioning);
    }

    if (!_isEqual(prevProps.position, position)) {
      this.setState({
        position: position
      });
      this.setOverlayPosition(position);
    }
  }

  /**
   * Called on lifecycle componentWillUnmount.
   */
  componentWillUnmount() {
    this.props.map.un('click', this.onMapClick);
    this.unmountOverlayHelperElement();
  }

  /**
   * Mounts a invisible, non-disruptive element inside the body of the
   * application. The element will be used to render a copy of children of this
   * component inside to check if the child components are ready to be added
   * to this element. Because the height of the child components can't be known
   * before they are rendered, this is needed to ensure the overlay will have
   * the correct size and autoPan will work in a proper style.
   */
  mountOverlayHelperElement() {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.left = '-1000px';
    div.style.top = '-1000px';
    div.id = 'feature-info-overlay-helper';
    document.body.appendChild(div);

    this.overlayHelperElement = div;
  }

  /**
   * Unmounts the helper element.
   */
  unmountOverlayHelperElement() {
    if (!this.overlayHelperElement) {
      return;
    }
    const parent = this.overlayHelperElement.parentNode;
    if (parent) {
      parent.removeChild(this.overlayHelperElement);
    }
    this.overlayHelperElement = null;
  }

  /**
   * Creates the overlay that wraps the current component.
   */
  createOverlay() {
    let featureInfoOverlay = new OlOverlay({
      element: this.overlayElement,
      offset: this.props.offset,
      positioning: this.props.positioning,
      stopEvent: this.props.stopEvent,
      insertFirst: this.props.insertFirst,
      autoPan: this.props.autoPan,
      autoPanAnimation: this.props.autoPanAnimation,
      autoPanMargin: this.props.autoPanMargin
    });

    // Sync the position's state.
    featureInfoOverlay.on('change:position', () => {
      this.setState({
        position: this.getOverlayPosition()
      });
    });

    // If the pointer is over the popup, no pointermove should be fired.
    if (this.overlayElement) {
      this.overlayElement.onpointermove = (evt: React.MouseEvent) => evt.stopPropagation();
    }

    this.featureInfoOverlay = featureInfoOverlay;
  }

  /**
   * Hides the overlay.
   */
  onMapClick() {
    this.setOverlayPosition(undefined);
  }

  /**
   * Returns the current position of the overlay.
   *
   * @return {ol.Coordinate} The current position of the overlay.
   */
  getOverlayPosition() {
    if (this.featureInfoOverlay) {
      return this.featureInfoOverlay.getPosition();
    }
  }

  /**
   * Sets the position of the overlay (if any).
   *
   * @param {Array} position The position to set.
   */
  setOverlayPosition(position: number[]) {
    if (this.featureInfoOverlay) {
      this.featureInfoOverlay.setPosition(position);
    }
  }

  /**
   * Sets the node element as class attribute.
   *
   * @param {Element} element The `feature-info-popup` (Virtual-)DOMElement.
   */
  setOverlayElement(element: any) {
    this.overlayElement = element;
  }

  /**
   * Updates the position of the popup as soon as the child elements are ready
   * (ready = child elements are ready and their height is known).
   */
  updatePopupPosition() {
    // Only proceed if the helper element (see #mountOverlayHelperElement) and
    // the feature-info-popup element are available.
    if (this.overlayHelperElement && this.overlayElement) {
      // Empty the helper element, but normally it should be empty anyways.
      while (this.overlayHelperElement.firstChild) {
        this.overlayHelperElement.removeChild(this.overlayHelperElement.firstChild);
      }
      // Create a clone of the feature-info-popup element to prevent any side
      // effects with react or the ol overlay.
      const overlayElementClone: any = this.overlayElement.cloneNode(true);
      // Append the cloned element to the helper elemend, this way it will be
      // mounted and size attributes are available.
      const mount: any = this.overlayHelperElement.appendChild(overlayElementClone);
      // We assume, taht as soon as the element has a `clientHeight` set, it
      // is ready and the overlay position can be updated (safely).
      if (mount.clientHeight) {
        this.setOverlayPosition(this.state.position);
      }
      // Remove the cloned element every time, even if it's not fully rendered.
      this.overlayHelperElement.removeChild(this.overlayHelperElement.firstChild);
    }
  }

  /**
   * The render method.
   *
   * @return {Component} The component.
   */
  render() {
    const {
      map,
      children
    } = this.props;

    if (map && map.getTargetElement()) {
      map.getTargetElement().style.cursor = this.props.isLoading ? 'progress' : '';
    }

    return (
      <div
        className='feature-info-popup'
        ref={this.featureInfoPopup}
        style={{
          width: this.props.width
        }}
      >
        {children}
      </div>
    );
  }
}

export default FeatureInfo;
