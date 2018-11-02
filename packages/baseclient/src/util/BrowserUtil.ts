/**
 * Helper class for browsers.
 *
 * @class
 */
export class BrowserUtil {

  /**
   * Returns a boolean if a mobile device is detected
   *
   * @return {Boolean} Is a mobile device detected
   */
  static isMobile(): boolean {
    return window.matchMedia && window.matchMedia('only screen and (max-width: 1200px)').matches;
  }

}
export default BrowserUtil;
