import { VerifyEmailUseCase } from './verify-email.use-case';

import { InMemoryUserRepository } from '../repositories/in-memory-user.repository';

import { InMemoryEmailVerificationTokenRepository } from '../repositories/in-memory-email-verification-token.repository';

import { FakeTokenHasher } from '../services/fake-token-hasher';

import { User } from '../../domain/entities/user.entity';

import { EmailVerificationToken } from '../../domain/entities/email-verification-token.entity';

import { FakeClock } from '../../../shared/domain/fake-clock';

describe('VerifyEmailUseCase', () => {
  const createDependencies = () => {
    const clock = new FakeClock(new Date('2026-08-12T10:00:00.000Z'));

    const userRepository = new InMemoryUserRepository();

    const tokenRepository = new InMemoryEmailVerificationTokenRepository();

    const tokenHasher = new FakeTokenHasher();

    const useCase = new VerifyEmailUseCase(
      userRepository,
      tokenRepository,
      tokenHasher,
    );

    return {
      clock,
      userRepository,
      tokenRepository,
      useCase,
    };
  };

  const createUser = (clock: FakeClock): User => {
    return User.create(
      {
        id: 'user-id',
        name: 'Caroline',
        email: 'caroline@example.com',
      },
      clock,
    );
  };

  const createToken = (
    clock: FakeClock,
    tokenHash = 'hashed-verification-token',
  ): EmailVerificationToken => {
    return EmailVerificationToken.create(
      {
        id: 'verification-token-id',
        userId: 'user-id',
        tokenHash,
        expiresAt: new Date('2026-08-12T10:30:00.000Z'),
      },
      clock,
    );
  };

  it('should verify the user email', async () => {
    const { clock, userRepository, tokenRepository, useCase } =
      createDependencies();

    const user = createUser(clock);
    const token = createToken(clock);

    await userRepository.save(user);
    await tokenRepository.save(token);

    await useCase.execute({
      userId: 'user-id',
      token: 'verification-token',
    });

    const updatedUser = await userRepository.findById('user-id');

    const updatedToken = await tokenRepository.findByUserId('user-id');

    expect(updatedUser?.getEmailVerifiedAt()).toEqual(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    expect(updatedToken?.isUsed()).toBe(true);
  });

  it('should throw when user does not exist', async () => {
    const { useCase } = createDependencies();

    await expect(
      useCase.execute({
        userId: 'unknown-user',
        token: 'verification-token',
      }),
    ).rejects.toThrow('User not found');
  });

  it('should throw when token does not exist', async () => {
    const { clock, userRepository, useCase } = createDependencies();

    const user = createUser(clock);

    await userRepository.save(user);

    await expect(
      useCase.execute({
        userId: 'user-id',
        token: 'verification-token',
      }),
    ).rejects.toThrow('Email verification token not found');
  });

  it('should throw when token is invalid', async () => {
    const { clock, userRepository, tokenRepository, useCase } =
      createDependencies();

    const user = createUser(clock);
    const token = createToken(clock);

    await userRepository.save(user);
    await tokenRepository.save(token);

    await expect(
      useCase.execute({
        userId: 'user-id',
        token: 'wrong-token',
      }),
    ).rejects.toThrow('Invalid email verification token');
  });

  it('should throw when token is expired', async () => {
    const { clock, userRepository, tokenRepository, useCase } =
      createDependencies();

    const user = createUser(clock);
    const token = createToken(clock);

    await userRepository.save(user);
    await tokenRepository.save(token);

    clock.setNow(new Date('2026-08-12T10:30:00.000Z'));

    await expect(
      useCase.execute({
        userId: 'user-id',
        token: 'verification-token',
      }),
    ).rejects.toThrow('Email verification token has expired');
  });

  it('should throw when token was already used', async () => {
    const { clock, userRepository, tokenRepository, useCase } =
      createDependencies();

    const user = createUser(clock);
    const token = createToken(clock);

    token.markAsUsed();

    await userRepository.save(user);
    await tokenRepository.save(token);

    await expect(
      useCase.execute({
        userId: 'user-id',
        token: 'verification-token',
      }),
    ).rejects.toThrow('Email verification token has already been used');
  });

  it('should throw when email is already verified', async () => {
    const { clock, userRepository, tokenRepository, useCase } =
      createDependencies();

    const user = createUser(clock);
    const token = createToken(clock);

    user.verifyEmail();

    await userRepository.save(user);
    await tokenRepository.save(token);

    await expect(
      useCase.execute({
        userId: 'user-id',
        token: 'verification-token',
      }),
    ).rejects.toThrow('User email is already verified');
  });
});
