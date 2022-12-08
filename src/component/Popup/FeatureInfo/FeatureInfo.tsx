import React, { useEffect } from 'react';
import OlMap from 'ol/Map';
import OlOverlay from 'ol/Overlay';

import './FeatureInfo.css';

interface DefaultFeatureInfoProps {
  /**
   * The max width of the popup.
   * @type {Number}
   */
  maxWidth?: number;

  /**
   * Offsets in pixels used when positioning the overlay. The first element
   * in the array is the horizontal offset. A positive value shifts the
   * overlay right. The second element in the array is the vertical offset.
   * A positive value shifts the overlay down.
   * @type {Array}
   */
  offset?: number[];

  /**
   * Whether event propagation to the map viewport should be stopped. If true
   * the overlay is placed in the same container as that of the controls
   * (CSS class name ol-overlaycontainer-stopevent); if false it is placed in
   * the container with CSS class name ol-overlaycontainer.
   * @type {Boolean}
   */
  stopEvent?: boolean;

  /**
   * Whether the overlay is inserted first in the overlay container, or
   * appended. If the overlay is placed in the same container as that of the
   * controls (see the stopEvent option) you will probably set insertFirst to
   * true so the overlay is displayed below the controls.
   * @type {Boolean}
   */
  insertFirst?: boolean;

  /**
   * If set to true the map is panned when calling setPosition, so that the
   * overlay is entirely visible in the current viewport.
   * @type {Boolean}
   */
  autoPan?: boolean;

  /**
   * The animation options used to pan the overlay into view. This animation
   * is only used when autoPan is enabled. A duration and easing may be
   * provided to customize the animation.
   * @type {Object}
   */
  autoPanAnimationDuration?: number;

  autoPanMargin?: number;
}

interface FeatureInfoProps extends Partial<DefaultFeatureInfoProps> {

  map: OlMap;
  position: number[];
  /**
   * Defines how the overlay is actually positioned with respect to its
   * position property. Possible values are 'bottom-left', 'bottom-center',
   * 'bottom-right', 'center-left', 'center-center', 'center-right',
   * 'top-left', 'top-center', and 'top-right'.
   * @type {String}
   */
  // See https://github.com/openlayers/openlayers/pull/12696
  positioning: any;

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
  children: React.ReactElement;
}

export type ComponentProps = DefaultFeatureInfoProps & FeatureInfoProps;

/**
 * Feature info overlay element.
 * @type {OlOverlay}
 */
let featureInfoOverlay: OlOverlay = null;

/**
 * The root div node rendered inside this component. Will be filled
 * in ref callback and be used as HTML element for the OlOverlay.
 * @type {HTMLElement}
 */
let overlayElement: HTMLElement = null;

/**
 * An invisible, non-disruptive element, that will be used to calculate the
 * height of the children of this component.
 * @type {HTMLElement}
 */
let overlayHelperElement: HTMLElement = null;

/**
 * The FeatureInfoPopup component.
 *
 * @class FeatureInfo.
 * @extends React.Component
 */
export const FeatureInfo: React.FC<ComponentProps> = ({
  map,
  isLoading,
  children,
  maxWidth = 300,
  offset = [0, 0],
  stopEvent = false,
  insertFirst = true,
  autoPan = true,
  autoPanAnimationDuration = 250,
  autoPanMargin = 20,
  positioning,
  position
}): React.ReactElement => {

  /**
   * Reference to feature info popup
   * @type {HTMLDivElement}
   */
  const featureInfoPopup: React.RefObject<HTMLDivElement> = React.createRef();

  useEffect(() => {
    mountOverlayHelperElement();
    setOverlayElement(featureInfoPopup.current);
    updatePopupPosition();
    createOverlay();
    map.on('click', onMapClick);
    return () => {
      map.un('click', onMapClick);
      unmountOverlayHelperElement();

    };
  }, []);

  useEffect(() => {
    if (!featureInfoOverlay) {
      return;
    }
    featureInfoOverlay.setPositioning(positioning);
    setOverlayPosition(position);
    if (!positioning && position) {
      const optFit = getAutoPositioning(position as [number, number]);
      featureInfoOverlay.setPositioning(optFit);
    }
  }, [position, positioning]);

  useEffect(() => {
    if (map && map.getTargetElement()) {
      map.getTargetElement().style.cursor = isLoading ? 'progress' : '';
    }
  }, [map, isLoading]);

  /**
 * Calculates the positioning of the overlay relative to the olEvt position
 * inside the map.
 *
 * @param {Number[]} pos The click coordinate.
 * @return {String} positioning
 */
  const getAutoPositioning = (pos: [number, number]): any => {
    const mapSize = map.getSize();
    const horizontalPositioning = (mapSize[1] / 2) < pos[1] ? 'bottom' : 'top';
    const verticalPositioning = (mapSize[0] / 2) < pos[0] ? 'right' : 'left';
    const autoPositioning = `${horizontalPositioning}-${verticalPositioning}`;

    return autoPositioning;
  };

  /**
   * Mounts a invisible, non-disruptive element inside the body of the
   * application. The element will be used to render a copy of children of this
   * component inside to check if the child components are ready to be added
   * to this element. Because the height of the child components can't be known
   * before they are rendered, this is needed to ensure the overlay will have
   * the correct size and autoPan will work in a proper style.
 */
  const mountOverlayHelperElement = (): void => {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.left = '-1000px';
    div.style.top = '-1000px';
    div.id = 'feature-info-overlay-helper';
    document.body.appendChild(div);

    overlayHelperElement = div;
  };

  /**
   * Unmounts the helper element.
   */
  const unmountOverlayHelperElement = (): void => {
    if (!overlayHelperElement) {
      return;
    }
    const parent = overlayHelperElement.parentNode;
    if (parent) {
      parent.removeChild(overlayHelperElement);
    }
    overlayHelperElement = null;
  };

  /**
   * Creates the overlay that wraps the current component.
   */
  const createOverlay = (): void => {
    const overlay = new OlOverlay({
      element: overlayElement,
      offset,
      positioning,
      stopEvent,
      insertFirst,
      autoPan: {
        animation: {
          duration: autoPanAnimationDuration
        },
        margin: autoPanMargin
      },
    });

    // If the pointer is over the popup, no pointermove should be fired.
    // Onpointerdown covers the mobile mode event propagation.
    if (overlayElement) {
      overlayElement.onpointermove = (evt: Event) => evt.stopPropagation();
      overlayElement.onpointerdown = (evt: Event) => evt.stopPropagation();
    }

    featureInfoOverlay = overlay;
    map.addOverlay(featureInfoOverlay);
  };

  /**
   * Hides the overlay.
   */
  const onMapClick = () => {
    setOverlayPosition(undefined);
  };

  /**
   * Sets the position of the overlay (if any).
   *
   * @param {Array} pos The position to set.
   */
  const setOverlayPosition = (pos: number[]) => {
    if (featureInfoOverlay) {
      featureInfoOverlay.setPosition(pos);
    }
  };

  /**
  * Sets the node element as class attribute.
  *
  * @param {Element} element The `feature-info-popup` (Virtual-)DOMElement.
  */
  const setOverlayElement = (element: HTMLElement) => {
    overlayElement = element;
  };

  /**
  * Updates the position of the popup as soon as the child elements are ready
  * (ready = child elements are ready and their height is known).
  */
  const updatePopupPosition = (): void => {
    // Only proceed if the helper element (see #mountOverlayHelperElement) and
    // the feature-info-popup element are available.
    if (overlayHelperElement && overlayElement) {
      // Empty the helper element, but normally it should be empty anyways.
      while (overlayHelperElement.firstChild) {
        overlayHelperElement.removeChild(overlayHelperElement.firstChild);
      }
      // Create a clone of the feature-info-popup element to prevent any side
      // effects with react or the ol overlay.
      const overlayElementClone: HTMLElement = overlayElement.cloneNode(true) as HTMLElement;
      // Append the cloned element to the helper elemend, this way it will be
      // mounted and size attributes are available.
      const mount: HTMLElement = overlayHelperElement.appendChild(overlayElementClone);
      // We assume, taht as soon as the element has a `clientHeight` set, it
      // is ready and the overlay position can be updated (safely).
      if (mount.clientHeight) {
        setOverlayPosition(position);
      }
      // Remove the cloned element every time, even if it's not fully rendered.
      overlayHelperElement.removeChild(overlayHelperElement.firstChild);
    }
  };

  return (
    <div
      className='feature-info-popup'
      ref={featureInfoPopup}
      style={{ maxWidth }}
    >
      {children}
    </div>
  );
};

export default FeatureInfo;
