import { VerifyTwoFactorAuthenticationUseCase } from './verify-two-factor-authentication.use-case';

import type { TwoFactorAuthenticationRepository } from '../../domain/repositories/two-factor-authentication.repository';

import type { TwoFactorAuthenticator } from '../../domain/services/two-factor-authenticator';

describe('VerifyTwoFactorAuthenticationUseCase', () => {
  it('should verify a valid two-factor code', async () => {
    const repository = {
      findByUserId: jest.fn().mockResolvedValue({
        isEnabled: () => true,
        getSecret: () => 'secret',
      }),
    } as unknown as TwoFactorAuthenticationRepository;

    const authenticator = {
      generateSecret: jest.fn(),
      verifyCode: jest.fn().mockResolvedValue(true),
    } as unknown as TwoFactorAuthenticator;

    const useCase = new VerifyTwoFactorAuthenticationUseCase(
      repository,
      authenticator,
    );

    const result = await useCase.execute({
      userId: 'user-id',
      code: '123456',
    });

    expect(repository.findByUserId).toHaveBeenCalledWith('user-id');

    expect(authenticator.verifyCode).toHaveBeenCalledWith('secret', '123456');

    expect(result).toBe(true);
  });

  it('should reject an invalid two-factor code', async () => {
    const repository = {
      findByUserId: jest.fn().mockResolvedValue({
        isEnabled: () => true,
        getSecret: () => 'secret',
      }),
    } as unknown as TwoFactorAuthenticationRepository;

    const authenticator = {
      generateSecret: jest.fn(),
      verifyCode: jest.fn().mockResolvedValue(false),
    } as unknown as TwoFactorAuthenticator;

    const useCase = new VerifyTwoFactorAuthenticationUseCase(
      repository,
      authenticator,
    );

    const result = await useCase.execute({
      userId: 'user-id',
      code: '000000',
    });

    expect(result).toBe(false);
  });

  it('should reject when two-factor authentication does not exist', async () => {
    const repository = {
      findByUserId: jest.fn().mockResolvedValue(null),
    } as unknown as TwoFactorAuthenticationRepository;

    const authenticator = {
      generateSecret: jest.fn(),
      verifyCode: jest.fn(),
    } as unknown as TwoFactorAuthenticator;

    const useCase = new VerifyTwoFactorAuthenticationUseCase(
      repository,
      authenticator,
    );

    const result = await useCase.execute({
      userId: 'user-id',
      code: '123456',
    });

    expect(result).toBe(false);

    expect(authenticator.verifyCode).not.toHaveBeenCalled();
  });

  it('should reject when two-factor authentication is not enabled', async () => {
    const repository = {
      findByUserId: jest.fn().mockResolvedValue({
        isEnabled: () => false,
        getSecret: () => 'secret',
      }),
    } as unknown as TwoFactorAuthenticationRepository;

    const authenticator = {
      generateSecret: jest.fn(),
      verifyCode: jest.fn(),
    } as unknown as TwoFactorAuthenticator;

    const useCase = new VerifyTwoFactorAuthenticationUseCase(
      repository,
      authenticator,
    );

    const result = await useCase.execute({
      userId: 'user-id',
      code: '123456',
    });

    expect(result).toBe(false);

    expect(authenticator.verifyCode).not.toHaveBeenCalled();
  });
});
