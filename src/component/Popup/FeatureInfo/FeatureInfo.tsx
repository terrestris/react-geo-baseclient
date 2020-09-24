import * as React from 'react';
import OlMap from 'ol/Map';
import OlOverlay from 'ol/Overlay';
import OverlayPositioning from 'ol/OverlayPositioning';

const isEqual = require('lodash/isEqual');

import './FeatureInfo.less';

interface DefaultFeatureInfoProps {
  offset: [number, number];
  stopEvent: boolean;
  insertFirst: boolean;
  autoPan: boolean;
  autoPanAnimationDuration: number;
  autoPanMargin: number;
  positioning: OverlayPositioning;
}

interface FeatureInfoProps extends Partial<DefaultFeatureInfoProps> {

  map: OlMap;
  position: number[];
  isLoading: boolean;
}

interface FeatureInfoState {
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
 * The default properties.
 */
  public static defaultProps: DefaultFeatureInfoProps = {
    offset: [0, 0],
    stopEvent: false,
    insertFirst: true,
    autoPan: true,
    autoPanAnimationDuration: 250,
    autoPanMargin: 20,
    positioning: null
  };

  /**
   * The root div node rendered inside this component. Will be filled
   * in ref callback and be used as HTML element for the OlOverlay.
   * @type {HTMLElement}
   */
  private overlayElement: HTMLElement = null;

  /**
   * An invisible, non-disruptive element, that will be used to calculate the
   * height of the children of this component.
   * @type {HTMLElement}
   */
  private overlayHelperElement: HTMLElement = null;

  /**
   * Feature info overlay element.
   * @type {OlOverlay}
   */
  private featureInfoOverlay: OlOverlay = null;

  /**
   * Reference to feature info popup
   * @type {HTMLDivElement}
   */
  private featureInfoPopup: React.RefObject<HTMLDivElement>;

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
  componentDidUpdate(prevProps: FeatureInfoProps) {

    const {
      position,
      positioning
    } = this.props;

    if (prevProps.positioning !== positioning) {
      this.featureInfoOverlay.setPositioning(positioning);
    }

    if (!isEqual(prevProps.position, position)) {
      this.setState({ position });
      this.setOverlayPosition(position);
    }

    if (!positioning && position) {
      const optFit = this.getAutoPositioning(position as [number, number]);
      this.featureInfoOverlay.setPositioning(optFit);
    }
  }

  /**
   * Calculates the positioning of the overlay  relative to the olEvt position
   * inside the map.
   *
   * @param {Number[]} position The click coordinate.
   * @return {String} positioning
   */
  getAutoPositioning(position: [number, number]): OverlayPositioning {
    const {
      map
    } = this.props;

    const mapSize = map.getSize();
    const horizontalPositioning = (mapSize[1] / 2) < position[1] ? 'bottom' : 'top';
    const verticalPositioning = (mapSize[0] / 2) < position[0] ? 'right' : 'left';
    const positioning = `${horizontalPositioning}-${verticalPositioning}`;

    return positioning as OverlayPositioning;
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
    const featureInfoOverlay = new OlOverlay({
      element: this.overlayElement,
      offset: this.props.offset,
      positioning: this.props.positioning,
      stopEvent: this.props.stopEvent,
      insertFirst: this.props.insertFirst,
      autoPan: this.props.autoPan,
      autoPanAnimation: {
        duration: this.props.autoPanAnimationDuration
      },
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
      this.overlayElement.onpointermove = (evt: Event) => evt.stopPropagation();
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
    return null;
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
      >
        {children}
      </div>
    );
  }
}

export default FeatureInfo;
