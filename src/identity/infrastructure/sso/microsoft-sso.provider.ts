import { Injectable } from '@nestjs/common';

import type {
  SsoAuthorization,
  SsoProvider,
  SsoUserProfile,
} from '../../domain/services/sso-provider';

@Injectable()
export class MicrosoftSsoProvider
  implements SsoProvider
{
  private readonly clientId =
    process.env.MICROSOFT_SSO_CLIENT_ID ?? '';

  private readonly clientSecret =
    process.env.MICROSOFT_SSO_CLIENT_SECRET ?? '';

  private readonly redirectUri =
    process.env.MICROSOFT_SSO_REDIRECT_URI ?? '';

  private readonly authorizationEndpoint =
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';

  private readonly tokenEndpoint =
    'https://login.microsoftonline.com/common/oauth2/v2.0/token';

  private readonly userInfoEndpoint =
    'https://graph.microsoft.com/v1.0/me';

  getName(): string {
    return 'microsoft';
  }

  async createAuthorizationUrl(
    state: string,
  ): Promise<SsoAuthorization> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      response_mode: 'query',
      scope: 'openid profile email User.Read',
      state,
    });

    return {
      authorizationUrl:
        `${this.authorizationEndpoint}?${params.toString()}`,
      state,
    };
  }

  async authenticate(
    code: string,
    state: string,
  ): Promise<SsoUserProfile> {
    if (!code) {
      throw new Error(
        'Microsoft authorization code is required',
      );
    }

    if (!state) {
      throw new Error(
        'Microsoft authorization state is required',
      );
    }

    const tokenResponse =
      await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

    if (!tokenResponse.ok) {
      throw new Error(
        'Failed to authenticate with Microsoft',
      );
    }

    const tokenData =
      (await tokenResponse.json()) as {
        access_token?: string;
      };

    if (!tokenData.access_token) {
      throw new Error(
        'Microsoft access token was not returned',
      );
    }

    const profileResponse =
      await fetch(this.userInfoEndpoint, {
        headers: {
          Authorization:
            `Bearer ${tokenData.access_token}`,
        },
      });

    if (!profileResponse.ok) {
      throw new Error(
        'Failed to retrieve Microsoft user profile',
      );
    }

    const profile =
      (await profileResponse.json()) as {
        id: string;
        displayName?: string;
        givenName?: string;
        surname?: string;
        mail?: string;
        userPrincipalName?: string;
      };

    const email =
      profile.mail ??
      profile.userPrincipalName;

    if (!email) {
      throw new Error(
        'Microsoft user email was not returned',
      );
    }

    return {
      providerUserId: profile.id,
      email,
      emailVerified: false,
      name:
        profile.displayName ??
        email,
      firstName:
        profile.givenName,
      lastName:
        profile.surname,
    };
  }
}