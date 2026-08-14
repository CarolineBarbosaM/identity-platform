import { config } from 'dotenv';

config({
  path: '.env.test',
});

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';

import { AppModule } from '../src/app.module';

import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../src/identity/domain/services/password-hasher';

import {
  PASSWORD_CREDENTIAL_REPOSITORY,
  type PasswordCredentialRepository,
} from '../src/identity/domain/repositories/password-credential.repository';

import { PasswordCredential } from '../src/identity/domain/entities/password-credential.entity';
import { FakeClock } from '../src/shared/domain/fake-clock';

import { SsoProviderRegistry } from '../src/identity/application/services/sso-provider-registry';
import { AuthenticateSsoUseCase } from '../src/identity/application/use-cases/authenticate-sso.use-case';

describe('Identity (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SsoProviderRegistry)
      .useValue({
        get: jest.fn().mockReturnValue({
          createAuthorizationUrl: jest.fn().mockImplementation(
            async (state: string) => ({
              authorizationUrl:
                `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=test-client-id&` +
                `redirect_uri=http://localhost:3000/auth/sso/google/callback&` +
                `response_type=code&` +
                `scope=openid%20email%20profile&` +
                `state=${state}`,
              state,
            }),
          ),
        }),
      })
      .overrideProvider(AuthenticateSsoUseCase)
      .useValue({
        execute: jest.fn().mockResolvedValue({
          userId: '22222222-2222-2222-2222-222222222222',
        }),
      })
      .compile();

    app = moduleRef.createNestApplication();

    await app.init();

    dataSource = app.get(DataSource);

    await dataSource.synchronize();

    const repository = app.get<PasswordCredentialRepository>(
      PASSWORD_CREDENTIAL_REPOSITORY,
    );

    const passwordHasher = app.get<PasswordHasher>(PASSWORD_HASHER);

    const passwordHash = await passwordHasher.hash('plain-password');

    const credential = PasswordCredential.create(
      {
        id: '11111111-1111-1111-1111-111111111111',
        userId: '22222222-2222-2222-2222-222222222222',
        passwordHash,
      },
      new FakeClock(new Date('2026-08-04T10:00:00.000Z')),
    );

    await repository.save(credential);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /auth/login should authenticate a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        userId: '22222222-2222-2222-2222-222222222222',
        password: 'plain-password',
      });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      authenticated: true,
      requiresTwoFactor: false,
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  it('POST /auth/login should reject invalid password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        userId: '22222222-2222-2222-2222-222222222222',
        password: 'wrong-password',
      });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      authenticated: false,
    });
  });

  it('POST /auth/logout should revoke the session', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        userId: '22222222-2222-2222-2222-222222222222',
        password: 'plain-password',
      });

    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.accessToken;
    const refreshToken = loginResponse.body.refreshToken;

    expect(accessToken).toEqual(expect.any(String));
    expect(refreshToken).toEqual(expect.any(String));

    const sessionId = refreshToken.split('.')[0];

    expect(sessionId).toEqual(expect.any(String));

    const logoutResponse = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sessionId,
      });

    expect(logoutResponse.status).toBe(204);

    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken,
      });

    expect(refreshResponse.status).toBe(401);
  });

  it('GET /auth/me should authenticate with a valid access token', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        userId: '22222222-2222-2222-2222-222222222222',
        password: 'plain-password',
      });

    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.accessToken;

    expect(accessToken).toEqual(expect.any(String));

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      userId: '22222222-2222-2222-2222-222222222222',
      tokenId: expect.any(String),
      expiresAt: expect.any(String),
    });
  });

  it('GET /auth/me should reject an unauthenticated request', async () => {
    const response = await request(app.getHttpServer()).get('/auth/me');

    expect(response.status).toBe(401);
  });

  it('GET /auth/sso/google should authenticate a user through Google SSO', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementation(
        async (
          input: RequestInfo | URL,
          init?: RequestInit,
        ) => {
          const url = input.toString();

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

          if (
            url ===
            'https://openidconnect.googleapis.com/v1/userinfo'
          ) {
            expect(init?.method).toBe('GET');

            expect(init?.headers).toEqual({
              Authorization: 'Bearer google-access-token',
            });

            return new Response(
              JSON.stringify({
                sub: 'google-e2e-user-id',
                email: 'google-e2e@example.com',
                email_verified: true,
                name: 'Google E2E User',
                given_name: 'Google',
                family_name: 'E2E',
                picture: 'https://example.com/google.jpg',
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

    try {
      const authorizationResponse = await request(
        app.getHttpServer(),
      ).get('/auth/sso/google');

      expect(authorizationResponse.status).toBe(200);

      expect(
        authorizationResponse.body.authorizationUrl,
      ).toContain(
        'https://accounts.google.com/o/oauth2/v2/auth',
      );

      expect(authorizationResponse.body.state).toEqual(
        expect.any(String),
      );

      const state = authorizationResponse.body.state;

      const callbackResponse = await request(
        app.getHttpServer(),
      )
        .get('/auth/sso/google/callback')
        .query({
          code: 'google-authorization-code',
          state,
        });

      expect(callbackResponse.status).toBe(200);

      expect(callbackResponse.body).toEqual({
        authenticated: true,
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    } finally {
      fetchMock.mockRestore();
    }
  });
});
