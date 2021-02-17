import config from '../../config/config';
import Application from '../../model/Application';
import GenericService from '../GenericService/GenericService';

class ApplicationService extends GenericService<Application> {

  constructor() {
    super(Application, config.applicationPath);
  }

}

export default ApplicationService;
