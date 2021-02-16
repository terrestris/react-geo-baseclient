import BaseEntity, { BaseEntityArgs } from './BaseEntity';
import LayerType from './enum/LayerType';

export interface LayerArgs extends BaseEntityArgs {
  clientConfig: any;
  features: any;
  name: string;
  sourceConfig: any;
  type: LayerType;
}

export default class Layer extends BaseEntity {
  clientConfig: any;
  features: any;
  name: string;
  sourceConfig: any;
  type: LayerType;

  constructor({id, created, modified, clientConfig, features, name, sourceConfig, type}: LayerArgs) {
    super({id, created, modified});

    this.features = features;
    this.clientConfig = clientConfig;
    this.name = name;
    this.sourceConfig = sourceConfig;
    this.type = type;
  }
}
