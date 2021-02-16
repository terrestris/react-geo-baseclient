import BaseEntity, { BaseEntityArgs } from './BaseEntity';

export interface ApplicationArgs extends BaseEntityArgs {
  name?: string;
  i18n?: any;
  stateOnly?: boolean;
  clientConfig?: any;
  layerTree?: any;
  layerConfig?: any;
  toolConfig?: any;
}

export default class Application extends BaseEntity {
  name?: string;
  i18n?: any;
  stateOnly?: boolean;
  clientConfig?: any;
  layerTree?: any;
  layerConfig?: any;
  toolConfig?: any;

  constructor({
    id,
    created,
    modified,
    name,
    i18n,
    stateOnly,
    clientConfig,
    layerTree,
    layerConfig,
    toolConfig
  }: ApplicationArgs) {
    super({id, created, modified});

    this.name = name;
    this.i18n = i18n;
    this.stateOnly = stateOnly;
    this.clientConfig = clientConfig;
    this.layerTree = layerTree;
    this.layerConfig = layerConfig;
    this.toolConfig = toolConfig;
  }
}
