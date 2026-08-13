import {
  EnableTwoFactorAuthenticationUseCase,
} from './enable-two-factor-authentication.use-case';

import {
  InMemoryTwoFactorAuthenticationRepository,
} from '../repositories/in-memory-two-factor-authentication.repository';

import {
  TwoFactorAuthentication,
} from '../../domain/entities/two-factor-authentication.entity';

import type {
  TwoFactorAuthenticator,
} from '../../domain/services/two-factor-authenticator';

import type {
  Clock,
} from '../../../shared/domain/clock';

describe('EnableTwoFactorAuthenticationUseCase', () => {
  it('should enable 2FA with a valid code', async () => {
    const repository =
      new InMemoryTwoFactorAuthenticationRepository();

    const authenticator: TwoFactorAuthenticator = {
      generateSecret: jest
        .fn()
        .mockResolvedValue('generated-secret'),

      verifyCode: jest
        .fn()
        .mockResolvedValue(true),
    };

    const now = new Date(
      '2026-08-13T10:00:00.000Z',
    );

    const clock: Clock = {
      now: jest
        .fn()
        .mockReturnValue(now),
    };

    const twoFactor =
      TwoFactorAuthentication.create(
        {
          id: '2fa-id',
          userId: 'user-id',
          secret: 'generated-secret',
        },
        clock,
      );

    await repository.save(twoFactor);

    const useCase =
      new EnableTwoFactorAuthenticationUseCase(
        repository,
        authenticator,
      );

    await useCase.execute({
      userId: 'user-id',
      code: '123456',
    });

    expect(
      authenticator.verifyCode,
    ).toHaveBeenCalledWith(
      'generated-secret',
      '123456',
    );

    const saved =
      await repository.findByUserId(
        'user-id',
      );

    expect(saved?.isEnabled()).toBe(true);
  });

  it('should reject an invalid code', async () => {
    const repository =
      new InMemoryTwoFactorAuthenticationRepository();

    const authenticator: TwoFactorAuthenticator = {
      generateSecret: jest
        .fn()
        .mockResolvedValue('generated-secret'),

      verifyCode: jest
        .fn()
        .mockResolvedValue(false),
    };

    const now = new Date(
      '2026-08-13T10:00:00.000Z',
    );

    const clock: Clock = {
      now: jest
        .fn()
        .mockReturnValue(now),
    };

    const twoFactor =
      TwoFactorAuthentication.create(
        {
          id: '2fa-id',
          userId: 'user-id',
          secret: 'generated-secret',
        },
        clock,
      );

    await repository.save(twoFactor);

    const useCase =
      new EnableTwoFactorAuthenticationUseCase(
        repository,
        authenticator,
      );

    await expect(
      useCase.execute({
        userId: 'user-id',
        code: 'wrong-code',
      }),
    ).rejects.toThrow(
      'Invalid two-factor authentication code',
    );

    expect(
      twoFactor.isEnabled(),
    ).toBe(false);
  });

  it('should reject when the 2FA configuration does not exist', async () => {
    const repository =
      new InMemoryTwoFactorAuthenticationRepository();

    const authenticator: TwoFactorAuthenticator = {
      generateSecret: jest
        .fn()
        .mockResolvedValue('generated-secret'),

      verifyCode: jest
        .fn()
        .mockResolvedValue(true),
    };

    const useCase =
      new EnableTwoFactorAuthenticationUseCase(
        repository,
        authenticator,
      );

    await expect(
      useCase.execute({
        userId: 'user-id',
        code: '123456',
      }),
    ).rejects.toThrow(
      'Two-factor authentication configuration not found',
    );

    expect(
      authenticator.verifyCode,
    ).not.toHaveBeenCalled();
  });

  it('should reject when 2FA is already enabled', async () => {
    const repository =
      new InMemoryTwoFactorAuthenticationRepository();

    const authenticator: TwoFactorAuthenticator = {
      generateSecret: jest
        .fn()
        .mockResolvedValue('generated-secret'),

      verifyCode: jest
        .fn()
        .mockResolvedValue(true),
    };

    const now = new Date(
      '2026-08-13T10:00:00.000Z',
    );

    const clock: Clock = {
      now: jest
        .fn()
        .mockReturnValue(now),
    };

    const twoFactor =
      TwoFactorAuthentication.create(
        {
          id: '2fa-id',
          userId: 'user-id',
          secret: 'generated-secret',
        },
        clock,
      );

    twoFactor.enable();

    await repository.save(twoFactor);

    const useCase =
      new EnableTwoFactorAuthenticationUseCase(
        repository,
        authenticator,
      );

    await expect(
      useCase.execute({
        userId: 'user-id',
        code: '123456',
      }),
    ).rejects.toThrow(
      'Two-factor authentication is already enabled',
    );

    expect(
      authenticator.verifyCode,
    ).not.toHaveBeenCalled();
  });
});
