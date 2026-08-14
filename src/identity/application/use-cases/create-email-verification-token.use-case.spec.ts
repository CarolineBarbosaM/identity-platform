import { CreateEmailVerificationTokenUseCase } from './create-email-verification-token.use-case';

import { InMemoryEmailVerificationTokenRepository } from '../repositories/in-memory-email-verification-token.repository';

import { FakeTokenHasher } from '../services/fake-token-hasher';

import { FakeClock } from '../../../shared/domain/fake-clock';

describe('CreateEmailVerificationTokenUseCase', () => {
  it('should create and persist an email verification token', async () => {
    const tokenRepository = new InMemoryEmailVerificationTokenRepository();

    const tokenHasher = new FakeTokenHasher();

    const clock = new FakeClock(new Date('2026-08-12T10:00:00.000Z'));

    const useCase = new CreateEmailVerificationTokenUseCase(
      tokenRepository,
      tokenHasher,
      clock,
    );

    const result = await useCase.execute({
      userId: 'user-id',
    });

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');

    const storedToken = await tokenRepository.findByUserId('user-id');

    expect(storedToken).not.toBeNull();

    expect(storedToken?.getUserId()).toBe('user-id');

    expect(storedToken?.getTokenHash()).toBe(`hashed-${result.token}`);

    expect(storedToken?.getExpiresAt()).toEqual(
      new Date('2026-08-12T10:30:00.000Z'),
    );
  });

  it('should create a new token on every execution', async () => {
    const tokenRepository = new InMemoryEmailVerificationTokenRepository();

    const tokenHasher = new FakeTokenHasher();

    const clock = new FakeClock(new Date('2026-08-12T10:00:00.000Z'));

    const useCase = new CreateEmailVerificationTokenUseCase(
      tokenRepository,
      tokenHasher,
      clock,
    );

    const first = await useCase.execute({
      userId: 'user-id',
    });

    const second = await useCase.execute({
      userId: 'user-id',
    });

    expect(first.token).not.toBe(second.token);
  });
});
