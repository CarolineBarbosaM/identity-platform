import { MicrosoftSsoProvider } from './microsoft-sso.provider';

describe('MicrosoftSsoProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      MICROSOFT_SSO_CLIENT_ID: 'microsoft-client-id',
      MICROSOFT_SSO_CLIENT_SECRET:
        'microsoft-client-secret',
      MICROSOFT_SSO_REDIRECT_URI:
        'http://localhost:3000/auth/sso/microsoft/callback',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return the microsoft provider name', () => {
    const provider =
      new MicrosoftSsoProvider();

    expect(provider.getName()).toBe(
      'microsoft',
    );
  });

  it('should create an authorization url', async () => {
    const provider =
      new MicrosoftSsoProvider();

    const result =
      await provider.createAuthorizationUrl(
        'state-123',
      );

    expect(result.state).toBe('state-123');

    expect(result.authorizationUrl).toContain(
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    );

    expect(result.authorizationUrl).toContain(
      'client_id=microsoft-client-id',
    );

    expect(result.authorizationUrl).toContain(
      'response_type=code',
    );

    expect(result.authorizationUrl).toContain(
      'state=state-123',
    );
  });

  it('should authenticate a user with microsoft', async () => {
    const provider =
      new MicrosoftSsoProvider();

    const fetchMock =
      jest
        .spyOn(global, 'fetch')
        .mockImplementation(
          async (
            input: RequestInfo | URL,
            init?: RequestInit,
          ) => {
            const url = input.toString();

            if (
              url.includes(
                '/oauth2/v2.0/token',
              )
            ) {
              expect(init?.method).toBe('POST');

              return new Response(
                JSON.stringify({
                  access_token:
                    'microsoft-access-token',
                }),
                {
                  status: 200,
                  headers: {
                    'Content-Type':
                      'application/json',
                  },
                },
              );
            }

            if (
              url.includes(
                'graph.microsoft.com/v1.0/me',
              )
            ) {
              expect(
                init?.headers,
              ).toEqual({
                Authorization:
                  'Bearer microsoft-access-token',
              });

              return new Response(
                JSON.stringify({
                  id: 'microsoft-user-id',
                  displayName:
                    'Caroline Barbosa',
                  givenName: 'Caroline',
                  surname: 'Barbosa',
                  mail: 'caroline@example.com',
                  userPrincipalName:
                    'caroline@example.com',
                }),
                {
                  status: 200,
                  headers: {
                    'Content-Type':
                      'application/json',
                  },
                },
              );
            }

            throw new Error(
              `Unexpected fetch url: ${url}`,
            );
          },
        );

    const result =
      await provider.authenticate(
        'authorization-code',
        'state-123',
      );

    expect(result).toEqual({
      providerUserId:
        'microsoft-user-id',
      email: 'caroline@example.com',
      name: 'Caroline Barbosa',
      firstName: 'Caroline',
      lastName: 'Barbosa',
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);

    fetchMock.mockRestore();
  });

  it('should use userPrincipalName when mail is unavailable', async () => {
    const provider =
      new MicrosoftSsoProvider();

    jest
      .spyOn(global, 'fetch')
      .mockImplementation(
        async (
          input: RequestInfo | URL,
        ) => {
          const url = input.toString();

          if (
            url.includes(
              '/oauth2/v2.0/token',
            )
          ) {
            return new Response(
              JSON.stringify({
                access_token:
                  'microsoft-access-token',
              }),
              { status: 200 },
            );
          }

          return new Response(
            JSON.stringify({
              id: 'microsoft-user-id',
              displayName: 'Caroline',
              givenName: 'Caroline',
              surname: 'Barbosa',
              userPrincipalName:
                'caroline@example.com',
            }),
            { status: 200 },
          );
        },
      );

    const result =
      await provider.authenticate(
        'authorization-code',
        'state-123',
      );

    expect(result.email).toBe(
      'caroline@example.com',
    );

    jest.restoreAllMocks();
  });

  it('should reject when microsoft does not return an access token', async () => {
    const provider =
      new MicrosoftSsoProvider();

    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({}),
          {
            status: 200,
          },
        ),
      );

    await expect(
      provider.authenticate(
        'authorization-code',
        'state-123',
      ),
    ).rejects.toThrow(
      'Microsoft access token was not returned',
    );

    jest.restoreAllMocks();
  });

  it('should reject when token exchange fails', async () => {
    const provider =
      new MicrosoftSsoProvider();

    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response(null, {
          status: 400,
        }),
      );

    await expect(
      provider.authenticate(
        'authorization-code',
        'state-123',
      ),
    ).rejects.toThrow(
      'Failed to authenticate with Microsoft',
    );

    jest.restoreAllMocks();
  });

  it('should reject when microsoft profile request fails', async () => {
    const provider =
      new MicrosoftSsoProvider();

    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token:
              'microsoft-access-token',
          }),
          {
            status: 200,
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(null, {
          status: 401,
        }),
      );

    await expect(
      provider.authenticate(
        'authorization-code',
        'state-123',
      ),
    ).rejects.toThrow(
      'Failed to retrieve Microsoft user profile',
    );

    jest.restoreAllMocks();
  });

  it('should reject when microsoft does not return an email', async () => {
    const provider =
      new MicrosoftSsoProvider();

    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token:
              'microsoft-access-token',
          }),
          {
            status: 200,
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'microsoft-user-id',
            displayName: 'Caroline',
          }),
          {
            status: 200,
          },
        ),
      );

    await expect(
      provider.authenticate(
        'authorization-code',
        'state-123',
      ),
    ).rejects.toThrow(
      'Microsoft user email was not returned',
    );

    jest.restoreAllMocks();
  });
});
