/**
 * A simple class detecting the user device by interpreting user-Agent
 *
 * @class
 */
export default class DeviceDetector {
  /**
     * Check if user-Agent contains mobile browser
     */
  static isMobileDevice () {
    /* eslint-disable max-len */
    const mobileQuery = window.matchMedia('only screen and (max-width: 450px) and (orientation: portrait), only screen and (max-width: 750px) and (orientation: landscape), only screen and (max-width: 580px)');
    const mobileNavigatorRegEx = new RegExp('/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/');
    const isMobile = (mobileQuery.matches || mobileNavigatorRegEx.test(window.navigator.userAgent));
    return isMobile;
  }
}
