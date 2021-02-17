import GenericService from '../GenericService/GenericService';
import User from '../../model/User';

import config from '../../config/config';

import CsrfUtil from '@terrestris/base-util/dist/CsrfUtil/CsrfUtil';

class UserService extends GenericService<User> {

  constructor() {
    super(User, config.userPath);
  }

  static logout(includeCsrfHeaders: boolean = false): void {
    const params: RequestInit = {
      credentials: 'same-origin',
      method: 'POST',
    };
    if (includeCsrfHeaders) {
      const csrfHeader = CsrfUtil.getHeader();
      params.headers = csrfHeader;
    }
    fetch(config.logoutUrl, params).then((response) => {
      if (response.url) {
        window.location.href = response.url;
      } else {
        window.location.reload();
      }
    });
  }

}

export default UserService;
