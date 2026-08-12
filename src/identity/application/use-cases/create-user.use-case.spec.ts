import { CreateUserUseCase } from './create-user.use-case';

import { InMemoryUserRepository } from '../repositories/in-memory-user.repository';
import { InMemoryPasswordCredentialRepository } from '../repositories/in-memory-password-credential.repository';

import { FakePasswordHasher } from '../services/fake-password-hasher';
import { CreateEmailVerificationTokenUseCase } from './create-email-verification-token.use-case';

import { SystemClock } from '../../../shared/infrastructure/system-clock';

import { User } from '../../domain/entities/user.entity';

describe('CreateUserUseCase', () => {
  it('should create a user with a password credential', async () => {
    const userRepository =
      new InMemoryUserRepository();

    const passwordCredentialRepository =
      new InMemoryPasswordCredentialRepository();

    const passwordHasher =
      new FakePasswordHasher();

    const clock = new SystemClock();

    const createEmailVerificationToken = {
      execute: jest.fn().mockResolvedValue({
        token: 'verification-token',
      }),
    } as unknown as CreateEmailVerificationTokenUseCase;

    const useCase = new CreateUserUseCase(
      userRepository,
      passwordCredentialRepository,
      passwordHasher,
      clock,
      createEmailVerificationToken,
    );

    const result = await useCase.execute({
      name: 'Caroline',
      email: 'caroline@example.com',
      password: 'password123',
    });

    expect(result.user.getName()).toBe('Caroline');

    expect(result.user.getEmail()).toBe(
      'caroline@example.com',
    );

    expect(result.user.getStatus()).toBe(
      'PENDING_EMAIL_VERIFICATION',
    );

    const savedUser =
      await userRepository.findByEmail(
        'caroline@example.com',
      );

    expect(savedUser).not.toBeNull();

    const credential =
      await passwordCredentialRepository.findByUserId(
        result.user.getId(),
      );

    expect(credential).not.toBeNull();

    expect(
      credential?.getPasswordHash(),
    ).toBe('hashed-password123');

    expect(
      createEmailVerificationToken.execute,
    ).toHaveBeenCalledWith({
      userId: result.user.getId(),
    });
  });

  it('should not create a user with an existing email', async () => {
    const userRepository =
      new InMemoryUserRepository();

    const passwordCredentialRepository =
      new InMemoryPasswordCredentialRepository();

    const passwordHasher =
      new FakePasswordHasher();

    const clock = new SystemClock();

    const createEmailVerificationToken = {
      execute: jest.fn(),
    } as unknown as CreateEmailVerificationTokenUseCase;

    const existingUser = User.create(
      {
        id: 'existing-user-id',
        name: 'Existing User',
        email: 'caroline@example.com',
      },
      clock,
    );

    await userRepository.save(existingUser);

    const useCase = new CreateUserUseCase(
      userRepository,
      passwordCredentialRepository,
      passwordHasher,
      clock,
      createEmailVerificationToken,
    );

    await expect(
      useCase.execute({
        name: 'Caroline',
        email: 'caroline@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(
      'User with this email already exists',
    );

    expect(
      createEmailVerificationToken.execute,
    ).not.toHaveBeenCalled();
  });
});
