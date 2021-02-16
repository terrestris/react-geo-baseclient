import _ from 'lodash';
import moment, { Moment } from 'moment';

export interface BaseEntityArgs {
  id?: number;
  created?: string | Moment;
  modified?: string | Moment;
}

export default class BaseEntity {
  id?: number;
  created?: Moment;
  modified?: Moment;

  constructor({id, created, modified}: BaseEntityArgs) {
    this.id = id;
    this.created = _.isNil(created) ? created : moment(created);
    this.modified = _.isNil(modified) ? modified : moment(modified);
  }
}
