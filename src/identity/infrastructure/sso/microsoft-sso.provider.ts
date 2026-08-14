import { Injectable } from '@nestjs/common';

import type {
  SsoAuthorization,
  SsoProvider,
  SsoUserProfile,
} from '../../domain/services/sso-provider';

interface MicrosoftTokenResponse {
  access_token?: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

interface MicrosoftIdTokenClaims {
  email?: string;
  preferred_username?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  oid?: string;
  sub?: string;
  email_verified?: boolean;
}

interface MicrosoftUserProfileResponse {
  id: string;
  displayName?: string;
  givenName?: string;
  surname?: string;
  mail?: string;
  userPrincipalName?: string;
}

@Injectable()
export class MicrosoftSsoProvider implements SsoProvider {
  private readonly clientId = process.env.MICROSOFT_SSO_CLIENT_ID ?? '';

  private readonly clientSecret = process.env.MICROSOFT_SSO_CLIENT_SECRET ?? '';

  private readonly redirectUri = process.env.MICROSOFT_SSO_REDIRECT_URI ?? '';

  private readonly authorizationEndpoint =
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';

  private readonly tokenEndpoint =
    'https://login.microsoftonline.com/common/oauth2/v2.0/token';

  private readonly userInfoEndpoint = 'https://graph.microsoft.com/v1.0/me';

  getName(): string {
    return 'microsoft';
  }

  async createAuthorizationUrl(state: string): Promise<SsoAuthorization> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      response_mode: 'query',
      scope: 'openid profile email User.Read',
      state,
    });

    return {
      authorizationUrl: `${this.authorizationEndpoint}?${params.toString()}`,
      state,
    };
  }

  async authenticate(code: string, state: string): Promise<SsoUserProfile> {
    if (!code) {
      throw new Error('Microsoft authorization code is required');
    }

    if (!state) {
      throw new Error('Microsoft authorization state is required');
    }

    const tokenResponse = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
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
      throw new Error('Failed to authenticate with Microsoft');
    }

    const tokenData = (await tokenResponse.json()) as MicrosoftTokenResponse;

    if (!tokenData.access_token) {
      throw new Error('Microsoft access token was not returned');
    }

    if (!tokenData.id_token) {
      throw new Error('Microsoft ID token was not returned');
    }

    const claims = this.decodeIdTokenClaims(tokenData.id_token);

    const profileResponse = await fetch(this.userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to retrieve Microsoft user profile');
    }

    const profile =
      (await profileResponse.json()) as MicrosoftUserProfileResponse;

    const email =
      claims.email ??
      claims.preferred_username ??
      profile.mail ??
      profile.userPrincipalName;

    if (!email) {
      throw new Error('Microsoft user email was not returned');
    }

    const providerUserId = profile.id ?? claims.oid ?? claims.sub;

    if (!providerUserId) {
      throw new Error('Microsoft user identifier was not returned');
    }

    return {
      providerUserId,
      email,
      emailVerified: claims.email_verified === true,
      name: profile.displayName ?? claims.name ?? email,
      firstName: profile.givenName ?? claims.given_name,
      lastName: profile.surname ?? claims.family_name,
    };
  }

  private decodeIdTokenClaims(idToken: string): MicrosoftIdTokenClaims {
    const parts = idToken.split('.');

    if (parts.length !== 3) {
      throw new Error('Invalid Microsoft ID token');
    }

    const payload = parts[1];

    try {
      const decodedPayload = Buffer.from(payload, 'base64url').toString('utf8');

      return JSON.parse(decodedPayload) as MicrosoftIdTokenClaims;
    } catch {
      throw new Error('Invalid Microsoft ID token payload');
    }
  }
}
