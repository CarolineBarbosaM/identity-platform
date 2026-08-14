import { AuthenticateSsoUseCase } from './authenticate-sso.use-case';

import type { SsoProvider } from '../../domain/services/sso-provider';
import type { ExternalIdentityRepository } from '../../domain/repositories/external-identity.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';

import { ExternalIdentity } from '../../domain/entities/external-identity.entity';

describe('AuthenticateSsoUseCase', () => {
  it('should return the existing user when the external identity already exists', async () => {
    const existingIdentity =
      ExternalIdentity.create({
        id: 'external-identity-id',
        userId: 'user-id',
        provider: 'google',
        providerUserId: 'google-user-id',
        email: 'caroline@example.com',
      });

    const repository = {
      findByProviderAndProviderUserId:
        jest.fn().mockResolvedValue(
          existingIdentity,
        ),
      findByUserId: jest.fn(),
      save: jest.fn(),
    } as unknown as ExternalIdentityRepository;

    const userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as UserRepository;

    const provider = {
      getName: jest.fn().mockReturnValue(
        'google',
      ),
      createAuthorizationUrl: jest.fn(),
      authenticate: jest.fn().mockResolvedValue({
        providerUserId: 'google-user-id',
        email: 'caroline@example.com',
        emailVerified: true,
        name: 'Caroline',
      }),
    } as unknown as SsoProvider;

    const useCase =
      new AuthenticateSsoUseCase(
        repository,
        userRepository,
      );

    const result =
      await useCase.execute({
        provider,
        code: 'authorization-code',
        state: 'state',
      });

    expect(
      provider.authenticate,
    ).toHaveBeenCalledWith(
      'authorization-code',
      'state',
    );

    expect(
      repository
        .findByProviderAndProviderUserId,
    ).toHaveBeenCalledWith(
      'google',
      'google-user-id',
    );

    expect(
      userRepository.findByEmail,
    ).not.toHaveBeenCalled();

    expect(
      repository.save,
    ).not.toHaveBeenCalled();

    expect(result).toEqual({
      userId: 'user-id',
      provider: 'google',
      isNewIdentity: false,
    });
  });

  it('should create a new external identity when it does not exist', async () => {
    const repository = {
      findByProviderAndProviderUserId:
        jest.fn().mockResolvedValue(null),
      findByUserId: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as ExternalIdentityRepository;

    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as UserRepository;

    const provider = {
      getName: jest.fn().mockReturnValue(
        'google',
      ),
      createAuthorizationUrl: jest.fn(),
      authenticate: jest.fn().mockResolvedValue({
        providerUserId: 'google-user-id',
        email: 'caroline@example.com',
        emailVerified: true,
        name: 'Caroline',
      }),
    } as unknown as SsoProvider;

    const useCase =
      new AuthenticateSsoUseCase(
        repository,
        userRepository,
      );

    const result =
      await useCase.execute({
        provider,
        code: 'authorization-code',
        state: 'state',
      });

    expect(
      userRepository.findByEmail,
    ).toHaveBeenCalledWith(
      'caroline@example.com',
    );

    expect(
      repository.save,
    ).toHaveBeenCalledTimes(1);

    const savedIdentity =
      (
        repository.save as jest.Mock
      ).mock.calls[0][0] as ExternalIdentity;

    expect(
      savedIdentity.getProvider(),
    ).toBe('google');

    expect(
      savedIdentity.getProviderUserId(),
    ).toBe('google-user-id');

    expect(
      savedIdentity.getEmail(),
    ).toBe('caroline@example.com');

    expect(
      savedIdentity.getUserId(),
    ).toBe(result.userId);

    expect(result).toEqual({
      userId: result.userId,
      provider: 'google',
      isNewIdentity: true,
    });
  });

  it('should link a new external identity to an existing user by email', async () => {
    const repository = {
      findByProviderAndProviderUserId:
        jest.fn().mockResolvedValue(null),
      findByUserId: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as ExternalIdentityRepository;

    const existingUser = {
      getId: jest.fn().mockReturnValue(
        'existing-user-id',
      ),
    };

    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue(
        existingUser,
      ),
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as UserRepository;

    const provider = {
      getName: jest.fn().mockReturnValue(
        'google',
      ),
      createAuthorizationUrl: jest.fn(),
      authenticate: jest.fn().mockResolvedValue({
        providerUserId: 'google-user-id',
        email: 'caroline@example.com',
        emailVerified: true,
        name: 'Caroline',
      }),
    } as unknown as SsoProvider;

    const useCase =
      new AuthenticateSsoUseCase(
        repository,
        userRepository,
      );

    const result =
      await useCase.execute({
        provider,
        code: 'authorization-code',
        state: 'state',
      });

    expect(
      userRepository.findByEmail,
    ).toHaveBeenCalledWith(
      'caroline@example.com',
    );

    expect(
      repository.save,
    ).toHaveBeenCalledTimes(1);

    const savedIdentity =
      (
        repository.save as jest.Mock
      ).mock.calls[0][0] as ExternalIdentity;

    expect(
      savedIdentity.getUserId(),
    ).toBe('existing-user-id');

    expect(result).toEqual({
      userId: 'existing-user-id',
      provider: 'google',
      isNewIdentity: true,
    });
  });
});