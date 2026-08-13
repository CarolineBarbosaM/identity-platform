import { AuthenticateUser } from './authenticate-user.use-case';

import type {
  PasswordCredentialRepository,
} from '../../domain/repositories/password-credential.repository';

import type {
  PasswordHasher,
} from '../../domain/services/password-hasher';

import type {
  TwoFactorAuthenticationRepository,
} from '../../domain/repositories/two-factor-authentication.repository';

describe('AuthenticateUser', () => {
  it('should authenticate a user with a valid password', async () => {
    const repository = {
      findByUserId: jest.fn().mockResolvedValue({
        getPasswordHash: () => 'hashed-password',
      }),
    } as unknown as PasswordCredentialRepository;

    const passwordHasher = {
      compare: jest.fn().mockResolvedValue(true),
    } as unknown as PasswordHasher;

    const twoFactorRepository = {
      findByUserId: jest.fn().mockResolvedValue(null),
    } as unknown as TwoFactorAuthenticationRepository;

    const authenticateUser = new AuthenticateUser(
      repository,
      passwordHasher,
      twoFactorRepository,
    );

    const result = await authenticateUser.execute({
      userId: 'user-id',
      password: 'plain-password',
    });

    expect(repository.findByUserId).toHaveBeenCalledWith(
      'user-id',
    );

    expect(passwordHasher.compare).toHaveBeenCalledWith(
      'plain-password',
      'hashed-password',
    );

    expect(
      twoFactorRepository.findByUserId,
    ).toHaveBeenCalledWith('user-id');

    expect(result).toEqual({
      authenticated: true,
      requiresTwoFactor: false,
    });
  });

  it('should not authenticate a user without a password credential', async () => {
    const repository = {
      findByUserId: jest.fn().mockResolvedValue(null),
    } as unknown as PasswordCredentialRepository;

    const passwordHasher = {
      compare: jest.fn(),
    } as unknown as PasswordHasher;

    const twoFactorRepository = {
      findByUserId: jest.fn(),
    } as unknown as TwoFactorAuthenticationRepository;

    const authenticateUser = new AuthenticateUser(
      repository,
      passwordHasher,
      twoFactorRepository,
    );

    const result = await authenticateUser.execute({
      userId: 'user-id',
      password: 'plain-password',
    });

    expect(repository.findByUserId).toHaveBeenCalledWith(
      'user-id',
    );

    expect(passwordHasher.compare).not.toHaveBeenCalled();

    expect(
      twoFactorRepository.findByUserId,
    ).not.toHaveBeenCalled();

    expect(result).toEqual({
      authenticated: false,
      requiresTwoFactor: false,
    });
  });

  it('should not authenticate a user with an invalid password', async () => {
    const repository = {
      findByUserId: jest.fn().mockResolvedValue({
        getPasswordHash: () => 'hashed-password',
      }),
    } as unknown as PasswordCredentialRepository;

    const passwordHasher = {
      compare: jest.fn().mockResolvedValue(false),
    } as unknown as PasswordHasher;

    const twoFactorRepository = {
      findByUserId: jest.fn(),
    } as unknown as TwoFactorAuthenticationRepository;

    const authenticateUser = new AuthenticateUser(
      repository,
      passwordHasher,
      twoFactorRepository,
    );

    const result = await authenticateUser.execute({
      userId: 'user-id',
      password: 'wrong-password',
    });

    expect(repository.findByUserId).toHaveBeenCalledWith(
      'user-id',
    );

    expect(passwordHasher.compare).toHaveBeenCalledWith(
      'wrong-password',
      'hashed-password',
    );

    expect(
      twoFactorRepository.findByUserId,
    ).not.toHaveBeenCalled();

    expect(result).toEqual({
      authenticated: false,
      requiresTwoFactor: false,
    });
  });

  it('should require two-factor authentication when 2FA is enabled', async () => {
    const repository = {
      findByUserId: jest.fn().mockResolvedValue({
        getPasswordHash: () => 'hashed-password',
      }),
    } as unknown as PasswordCredentialRepository;

    const passwordHasher = {
      compare: jest.fn().mockResolvedValue(true),
    } as unknown as PasswordHasher;

    const twoFactorRepository = {
      findByUserId: jest.fn().mockResolvedValue({
        isEnabled: () => true,
      }),
    } as unknown as TwoFactorAuthenticationRepository;

    const authenticateUser = new AuthenticateUser(
      repository,
      passwordHasher,
      twoFactorRepository,
    );

    const result = await authenticateUser.execute({
      userId: 'user-id',
      password: 'plain-password',
    });

    expect(result).toEqual({
      authenticated: true,
      requiresTwoFactor: true,
    });
  });
});
