import { PasswordCredential } from '../../domain/entities/password-credential.entity';
import { PasswordHasher } from '../../domain/services/password-hasher';
import { PasswordCredentialRepository } from '../../domain/repositories/password-credential.repository';
import { AuthenticateUser } from './authenticate-user.use-case';
import { FakeClock } from '../../../shared/domain/fake-clock';

describe('AuthenticateUser', () => {
  it('should authenticate a user with a valid password', async () => {
    const passwordHasher: PasswordHasher = {
      hash: jest.fn().mockResolvedValue('hashed-password'),
      compare: jest.fn().mockResolvedValue(true),
    };

    const clock = new FakeClock(new Date('2026-08-04T10:00:00.000Z'));

    const credential = PasswordCredential.create(
      {
        id: 'credential-id',
        userId: 'user-id',
        passwordHash: 'hashed-password',
      },
      clock,
    );

    const repository: PasswordCredentialRepository = {
      findByUserId: jest.fn().mockResolvedValue(credential),
      save: jest.fn(),
    };

    const useCase = new AuthenticateUser(repository, passwordHasher);

    const result = await useCase.execute({
      userId: 'user-id',
      password: 'plain-password',
    });

    expect(repository.findByUserId).toHaveBeenCalledWith('user-id');
    expect(passwordHasher.compare).toHaveBeenCalledWith(
      'plain-password',
      'hashed-password',
    );
    expect(result).toBe(true);
  });

  it('should not authenticate a user without a password credential', async () => {
    const passwordHasher: PasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const repository: PasswordCredentialRepository = {
      findByUserId: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };

    const useCase = new AuthenticateUser(repository, passwordHasher);

    const result = await useCase.execute({
      userId: 'user-id',
      password: 'plain-password',
    });

    expect(repository.findByUserId).toHaveBeenCalledWith('user-id');
    expect(passwordHasher.compare).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should not authenticate a user with an invalid password', async () => {
    const passwordHasher: PasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(false),
    };

    const clock = new FakeClock(new Date('2026-08-04T10:00:00.000Z'));

    const credential = PasswordCredential.create(
      {
        id: 'credential-id',
        userId: 'user-id',
        passwordHash: 'hashed-password',
      },
      clock,
    );

    const repository: PasswordCredentialRepository = {
      findByUserId: jest.fn().mockResolvedValue(credential),
      save: jest.fn(),
    };

    const useCase = new AuthenticateUser(repository, passwordHasher);

    const result = await useCase.execute({
      userId: 'user-id',
      password: 'wrong-password',
    });

    expect(passwordHasher.compare).toHaveBeenCalledWith(
      'wrong-password',
      'hashed-password',
    );
    expect(result).toBe(false);
  });
});
