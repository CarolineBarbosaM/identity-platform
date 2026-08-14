import { CreateTwoFactorAuthenticationUseCase } from './create-two-factor-authentication.use-case';

import { InMemoryTwoFactorAuthenticationRepository } from '../repositories/in-memory-two-factor-authentication.repository';

import type { TwoFactorAuthenticator } from '../../domain/services/two-factor-authenticator';

import type { Clock } from '../../../shared/domain/clock';

describe('CreateTwoFactorAuthenticationUseCase', () => {
  it('should create a 2FA configuration', async () => {
    const repository = new InMemoryTwoFactorAuthenticationRepository();

    const authenticator: TwoFactorAuthenticator = {
      generateSecret: jest.fn().mockResolvedValue('generated-secret'),

      verifyCode: jest.fn().mockResolvedValue(false),
    };

    const now = new Date('2026-08-13T10:00:00.000Z');

    const clock: Clock = {
      now: jest.fn().mockReturnValue(now),
    };

    const useCase = new CreateTwoFactorAuthenticationUseCase(
      repository,
      authenticator,
      clock,
    );

    const result = await useCase.execute({
      userId: 'user-id',
    });

    expect(result).toEqual({
      secret: 'generated-secret',
      enabled: false,
    });

    expect(authenticator.generateSecret).toHaveBeenCalledTimes(1);

    const saved = await repository.findByUserId('user-id');

    expect(saved).not.toBeNull();

    expect(saved?.getSecret()).toBe('generated-secret');

    expect(saved?.isEnabled()).toBe(false);
  });

  it('should return the existing 2FA configuration', async () => {
    const repository = new InMemoryTwoFactorAuthenticationRepository();

    const authenticator: TwoFactorAuthenticator = {
      generateSecret: jest.fn().mockResolvedValue('generated-secret'),

      verifyCode: jest.fn().mockResolvedValue(false),
    };

    const now = new Date('2026-08-13T10:00:00.000Z');

    const clock: Clock = {
      now: jest.fn().mockReturnValue(now),
    };

    const useCase = new CreateTwoFactorAuthenticationUseCase(
      repository,
      authenticator,
      clock,
    );

    await useCase.execute({
      userId: 'user-id',
    });

    const result = await useCase.execute({
      userId: 'user-id',
    });

    expect(result).toEqual({
      secret: 'generated-secret',
      enabled: false,
    });

    expect(authenticator.generateSecret).toHaveBeenCalledTimes(1);
  });
});
