export interface SsoUserProfile {
  providerUserId: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  pictureUrl?: string;
}

export interface SsoAuthorization {
  authorizationUrl: string;
  state: string;
}

export interface SsoProvider {
  getName(): string;

  createAuthorizationUrl(
    state: string,
  ): Promise<SsoAuthorization>;

  authenticate(
    code: string,
    state: string,
  ): Promise<SsoUserProfile>;
}

export const SSO_PROVIDERS = Symbol('SSO_PROVIDERS');
