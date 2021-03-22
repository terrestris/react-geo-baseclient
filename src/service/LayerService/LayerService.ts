import GenericService from '../GenericService/GenericService';

import config from '../../config/config';
import Layer from '../../model/Layer';

class LayerService extends GenericService<Layer> {

  constructor() {
    super(Layer, config.layerPath);
  }

}

export default LayerService;
