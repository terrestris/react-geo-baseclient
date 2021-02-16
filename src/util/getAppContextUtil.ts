import { Logger } from '@terrestris/base-util';

import { AppContextUtil } from './AppContextUtil/BaseAppContextUtil';
import Shogun2AppContextUtil from './AppContextUtil/Shogun2AppContextUtil';
import ShogunBootAppContextUtil from './AppContextUtil/ShogunBootAppContextUtil';

/**
 * Factory function that returns the appropriate application context util
 * instance for the given application mode (e.g. shogun2 or shogun-boot).
 */
export const getAppContextUtil = (): AppContextUtil => {
  const shogun2AppContextUtil = new Shogun2AppContextUtil();
  const shogunBootAppContextUtil = new ShogunBootAppContextUtil();

  if (shogun2AppContextUtil.canReadCurrentAppContext()) {
    return shogun2AppContextUtil;
  }

  if (shogunBootAppContextUtil.canReadCurrentAppContext()) {
    return shogunBootAppContextUtil;
  }

  Logger.error('Could not find an appropriate appContext parser!');
};

export default getAppContextUtil;
