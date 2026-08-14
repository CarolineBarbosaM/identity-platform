import type {
  SsoAuthorization,
  SsoProvider,
  SsoUserProfile,
} from '../../domain/services/sso-provider';

interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
}

interface GoogleUserInfoResponse {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export interface GoogleSsoProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class GoogleSsoProvider implements SsoProvider {
  private readonly authorizationEndpoint =
    'https://accounts.google.com/o/oauth2/v2/auth';

  private readonly tokenEndpoint =
    'https://oauth2.googleapis.com/token';

  private readonly userInfoEndpoint =
    'https://openidconnect.googleapis.com/v1/userinfo';

  constructor(
    private readonly config: GoogleSsoProviderConfig,
  ) {}

  getName(): string {
    return 'google';
  }

  async createAuthorizationUrl(
    state: string,
  ): Promise<SsoAuthorization> {
    const url = new URL(
      this.authorizationEndpoint,
    );

    url.searchParams.set(
      'client_id',
      this.config.clientId,
    );

    url.searchParams.set(
      'redirect_uri',
      this.config.redirectUri,
    );

    url.searchParams.set(
      'response_type',
      'code',
    );

    url.searchParams.set(
      'scope',
      'openid profile email',
    );

    url.searchParams.set(
      'state',
      state,
    );

    return {
      authorizationUrl: url.toString(),
      state,
    };
  }

  async authenticate(
    code: string,
    state: string,
  ): Promise<SsoUserProfile> {
    if (!code) {
      throw new Error(
        'Google authorization code is required',
      );
    }

    if (!state) {
      throw new Error(
        'Google authorization state is required',
      );
    }

    const tokenResponse =
      await this.exchangeCodeForToken(code);

    const userInfo =
      await this.getUserInfo(
        tokenResponse.access_token,
      );

    if (!userInfo.sub) {
      throw new Error(
        'Google user profile does not contain a subject identifier',
      );
    }

    if (!userInfo.email) {
      throw new Error(
        'Google user profile does not contain an email',
      );
    }

    return {
      providerUserId: userInfo.sub,
      email: userInfo.email,
      emailVerified:
        userInfo.email_verified ?? false,
      name:
        userInfo.name ??
        userInfo.email,
      firstName:
        userInfo.given_name,
      lastName:
        userInfo.family_name,
      pictureUrl:
        userInfo.picture,
    };
  }

  private async exchangeCodeForToken(
    code: string,
  ): Promise<GoogleTokenResponse> {
    const body =
      new URLSearchParams();

    body.set('code', code);

    body.set(
      'client_id',
      this.config.clientId,
    );

    body.set(
      'client_secret',
      this.config.clientSecret,
    );

    body.set(
      'redirect_uri',
      this.config.redirectUri,
    );

    body.set(
      'grant_type',
      'authorization_code',
    );

    const response =
      await fetch(
        this.tokenEndpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        },
      );

    if (!response.ok) {
      throw new Error(
        `Google token exchange failed with status ${response.status}`,
      );
    }

    const data =
      (await response.json()) as GoogleTokenResponse;

    if (!data.access_token) {
      throw new Error(
        'Google token response does not contain an access token',
      );
    }

    return data;
  }

  private async getUserInfo(
    accessToken: string,
  ): Promise<GoogleUserInfoResponse> {
    const response =
      await fetch(
        this.userInfoEndpoint,
        {
          method: 'GET',
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        },
      );

    if (!response.ok) {
      throw new Error(
        `Google user info request failed with status ${response.status}`,
      );
    }

    return (await response.json()) as
      GoogleUserInfoResponse;
  }
}
