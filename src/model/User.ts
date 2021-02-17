import BaseEntity, { BaseEntityArgs } from './BaseEntity';

export interface KeycloakRepresentation {
  self?: any;
  id?: string;
  origin?: any;
  createdTimestamp?: number;
  username?: string;
  enabled?: boolean;
  totp?: boolean;
  emailVerified?: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  federationLink?: string;
  serviceAccountClientId?: string;
  attributes?: any;
  credentials?: any;
  disableableCredentialTypes?: any[];
  requiredActions?: any[];
  federatedIdentities?: any;
  realmRoles?: any;
  clientRoles?: any;
  clientConsents?: any;
  notBefore?: number;
  applicationRoles?: any;
  socialLinks?: any;
  groups?: any;
  access?: {
    manageGroupMembership?: boolean;
    view?: boolean;
    mapRoles?: boolean;
    impersonate?: boolean;
    manage?: boolean;
  };
}

export interface UserArgs extends BaseEntityArgs {
  keycloakId?: string;
  keycloakRepresentation?: KeycloakRepresentation;
  clientConfig?: any;
  details?: any;
}

export default class User extends BaseEntity {
  keycloakId?: string;
  keycloakRepresentation?: KeycloakRepresentation;
  details?: any;
  clientConfig?: any;

  constructor({ id, created, modified, details, clientConfig, keycloakId, keycloakRepresentation }: UserArgs) {
    super({ id, created, modified });

    this.details = details;
    this.clientConfig = clientConfig;
    this.keycloakId = keycloakId;
    this.keycloakRepresentation = keycloakRepresentation;
  }
}
