import config from '../../config/config';
import { AppInfo } from '../../model/AppInfo';

class AppInfoService {

  constructor() { }

  async getAppInfo(): Promise<AppInfo> {
    try {
      return fetch(config.appInfoPath).then(r => r.json());
    } catch (error) {
      return Promise.reject(error);
    }
  }

}
export default AppInfoService;
