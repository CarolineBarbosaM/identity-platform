import { GoogleSsoProvider } from './google-sso.provider';

describe('GoogleSsoProvider', () => {
  const provider = new GoogleSsoProvider({
    clientId: 'google-client-id',
    clientSecret: 'google-client-secret',
    redirectUri: 'http://localhost:3000/auth/sso/google/callback',
  });

  it('should return google as provider name', () => {
    expect(provider.getName()).toBe('google');
  });

  it('should create a google authorization url', async () => {
    const result = await provider.createAuthorizationUrl('state-123');

    const url = new URL(result.authorizationUrl);

    expect(result.state).toBe('state-123');

    expect(url.origin + url.pathname).toBe(
      'https://accounts.google.com/o/oauth2/v2/auth',
    );

    expect(url.searchParams.get('client_id')).toBe('google-client-id');

    expect(url.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3000/auth/sso/google/callback',
    );

    expect(url.searchParams.get('response_type')).toBe('code');

    expect(url.searchParams.get('scope')).toBe('openid profile email');

    expect(url.searchParams.get('state')).toBe('state-123');
  });

  it('should authenticate a google user', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementation(
        async (input: RequestInfo | URL, init?: RequestInit) => {
          const url =
            typeof input === 'string'
              ? input
              : input instanceof URL
                ? input.toString()
                : input.url;

          if (url === 'https://oauth2.googleapis.com/token') {
            expect(init?.method).toBe('POST');

            return new Response(
              JSON.stringify({
                access_token: 'google-access-token',
              }),
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            );
          }

          if (url === 'https://openidconnect.googleapis.com/v1/userinfo') {
            expect(init?.method).toBe('GET');

            expect(init?.headers).toEqual({
              Authorization: 'Bearer google-access-token',
            });

            return new Response(
              JSON.stringify({
                sub: 'google-user-id',
                email: 'caroline@example.com',
                email_verified: true,
                name: 'Caroline Barbosa',
                given_name: 'Caroline',
                family_name: 'Barbosa',
                picture: 'https://example.com/photo.jpg',
              }),
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            );
          }

          throw new Error(`Unexpected fetch URL: ${url}`);
        },
      );

    await expect(
      provider.authenticate('authorization-code', 'state-123'),
    ).resolves.toEqual({
      providerUserId: 'google-user-id',
      email: 'caroline@example.com',
      emailVerified: true,
      name: 'Caroline Barbosa',
      firstName: 'Caroline',
      lastName: 'Barbosa',
      pictureUrl: 'https://example.com/photo.jpg',
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);

    fetchMock.mockRestore();
  });

  it('should reject when google token exchange fails', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          error: 'invalid_grant',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    await expect(
      provider.authenticate('invalid-code', 'state-123'),
    ).rejects.toThrow('Google token exchange failed with status 400');

    fetchMock.mockRestore();
  });
});
