import { UnauthorizedException } from '@nestjs/common';
import { RefreshSessionUseCase } from './refresh-session.use-case';
import { InMemorySessionRepository } from '../repositories/in-memory-session.repository';
import { FakeRefreshTokenGenerator } from '../services/fake-refresh-token-generator';
import { FakeTokenHasher } from '../services/fake-token-hasher';
import { FakeAccessTokenGenerator } from '../services/fake-access-token-generator';
import { FakeClock } from '../../../shared/domain/fake-clock';
import { Session } from '../../domain/entities/session.entity';

describe('RefreshSessionUseCase', () => {
  it('should refresh a valid session', async () => {
    const repository = new InMemorySessionRepository();
    const clock = new FakeClock(
      new Date('2026-08-05T10:00:00.000Z'),
    );

    const refreshTokenGenerator =
      new FakeRefreshTokenGenerator();

    const tokenHasher = new FakeTokenHasher();
    const accessTokenGenerator =
      new FakeAccessTokenGenerator();

    const sessionId = 'session-id';
    const refreshToken =
      `${sessionId}.refresh-token`;

    const session = Session.create(
      {
        id: sessionId,
        userId: 'user-id',
        refreshTokenHash:
          `hashed-${refreshToken}`,
        expiresAt: new Date(
          '2026-09-05T10:00:00.000Z',
        ),
      },
      clock,
    );

    await repository.save(session);

    const useCase = new RefreshSessionUseCase(
      repository,
      refreshTokenGenerator,
      tokenHasher,
      accessTokenGenerator,
      clock,
    );

    const result = await useCase.execute({
      refreshToken,
    });

    expect(result.accessToken).toBe(
      'access-token-user-id',
    );

    expect(result.refreshToken).toMatch(
      /^[0-9a-f-]+\.refresh-token$/,
    );

    expect(session.getRevokedAt()).not.toBeNull();

    const newSessionId =
      result.refreshToken.split('.')[0];

    const newSession =
      await repository.findById(newSessionId);

    expect(newSession).not.toBeNull();
    expect(newSession?.getUserId()).toBe(
      'user-id',
    );
    expect(newSession?.getRevokedAt()).toBeNull();
    expect(
      newSession?.getRefreshTokenHash(),
    ).toBe(
      `hashed-${result.refreshToken}`,
    );
  });

  it('should reject when session does not exist', async () => {
    const repository = new InMemorySessionRepository();
    const clock = new FakeClock(
      new Date('2026-08-05T10:00:00.000Z'),
    );

    const useCase = new RefreshSessionUseCase(
      repository,
      new FakeRefreshTokenGenerator(),
      new FakeTokenHasher(),
      new FakeAccessTokenGenerator(),
      clock,
    );

    await expect(
      useCase.execute({
        refreshToken:
          'unknown-session.refresh-token',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject a revoked session', async () => {
    const repository = new InMemorySessionRepository();
    const clock = new FakeClock(
      new Date('2026-08-05T10:00:00.000Z'),
    );

    const session = Session.create(
      {
        id: 'session-id',
        userId: 'user-id',
        refreshTokenHash:
          'hashed-session-id.refresh-token',
        expiresAt: new Date(
          '2026-09-05T10:00:00.000Z',
        ),
      },
      clock,
    );

    session.revoke(clock);

    await repository.save(session);

    const useCase = new RefreshSessionUseCase(
      repository,
      new FakeRefreshTokenGenerator(),
      new FakeTokenHasher(),
      new FakeAccessTokenGenerator(),
      clock,
    );

    await expect(
      useCase.execute({
        refreshToken:
          'session-id.refresh-token',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject an expired session', async () => {
    const repository = new InMemorySessionRepository();
    const clock = new FakeClock(
      new Date('2026-08-05T10:00:00.000Z'),
    );

    const session = Session.create(
      {
        id: 'session-id',
        userId: 'user-id',
        refreshTokenHash:
          'hashed-session-id.refresh-token',
        expiresAt: new Date(
          '2026-08-04T10:00:00.000Z',
        ),
      },
      clock,
    );

    await repository.save(session);

    const useCase = new RefreshSessionUseCase(
      repository,
      new FakeRefreshTokenGenerator(),
      new FakeTokenHasher(),
      new FakeAccessTokenGenerator(),
      clock,
    );

    await expect(
      useCase.execute({
        refreshToken:
          'session-id.refresh-token',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should revoke the session when refresh token is invalid', async () => {
    const repository = new InMemorySessionRepository();
    const clock = new FakeClock(
      new Date('2026-08-05T10:00:00.000Z'),
    );

    const session = Session.create(
      {
        id: 'session-id',
        userId: 'user-id',
        refreshTokenHash:
          'hashed-session-id.refresh-token',
        expiresAt: new Date(
          '2026-09-05T10:00:00.000Z',
        ),
      },
      clock,
    );

    await repository.save(session);

    const useCase = new RefreshSessionUseCase(
      repository,
      new FakeRefreshTokenGenerator(),
      new FakeTokenHasher(),
      new FakeAccessTokenGenerator(),
      clock,
    );

    await expect(
      useCase.execute({
        refreshToken:
          'session-id.wrong-token',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(session.getRevokedAt()).not.toBeNull();
  });
});