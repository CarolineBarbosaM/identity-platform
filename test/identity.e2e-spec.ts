import { PASSWORD_HASHER } from '../src/identity/domain/services/password-hasher';

import type { PasswordHasher } from '../src/identity/domain/services/password-hasher';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import {
  PASSWORD_CREDENTIAL_REPOSITORY,
  PasswordCredentialRepository,
} from '../src/identity/domain/repositories/password-credential.repository';
import { PasswordCredential } from '../src/identity/domain/entities/password-credential.entity';
import { FakeClock } from '../src/shared/domain/fake-clock';

describe('Identity (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();

    const repository = app.get<PasswordCredentialRepository>(
      PASSWORD_CREDENTIAL_REPOSITORY,
    );

    const passwordHasher = app.get<PasswordHasher>(PASSWORD_HASHER);

    const passwordHash = await passwordHasher.hash('plain-password');

    const credential = PasswordCredential.create(
      {
        id: 'credential-id',
        userId: 'user-id',
        passwordHash,
      },
      new FakeClock(new Date('2026-08-04T10:00:00.000Z')),
    );

    await repository.save(credential);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login should authenticate a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        userId: 'user-id',
        password: 'plain-password',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      authenticated: true,
      accessToken: expect.any(String),
      refreshToken: expect.stringMatching(/^[0-9a-f-]+\.refresh-token$/),
    });
  });

  it('POST /auth/login should reject invalid password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        userId: 'user-id',
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
        userId: 'user-id',
        password: 'plain-password',
      });

    expect(loginResponse.status).toBe(200);

    const refreshToken = loginResponse.body.refreshToken;

    const sessionId = refreshToken.split('.')[0];

    const logoutResponse = await request(app.getHttpServer())
      .post('/auth/logout')
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
    const loginResponse =
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          userId: 'user-id',
          password: 'plain-password',
        });

    const accessToken =
      loginResponse.body.accessToken;

    const response =
      await request(app.getHttpServer())
        .get('/auth/me')
        .set(
          'Authorization',
          `Bearer ${accessToken}`,
        );

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      userId: 'user-id',
    });
  });

  it('GET /auth/me should reject an unauthenticated request', async () => {
    const response =
      await request(app.getHttpServer())
        .get('/auth/me');

    expect(response.status).toBe(401);
  });
});
