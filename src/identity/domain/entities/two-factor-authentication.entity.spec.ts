import { TwoFactorAuthentication } from './two-factor-authentication.entity';

import type { Clock } from '../../../shared/domain/clock';

describe('TwoFactorAuthentication', () => {
  it('should create a 2FA configuration', () => {
    const now = new Date('2026-08-13T10:00:00.000Z');

    const clock: Clock = {
      now: jest.fn().mockReturnValue(now),
    };

    const twoFactor = TwoFactorAuthentication.create(
      {
        id: '2fa-id',
        userId: 'user-id',
        secret: 'totp-secret',
      },
      clock,
    );

    expect(twoFactor.getId()).toBe('2fa-id');

    expect(twoFactor.getUserId()).toBe('user-id');

    expect(twoFactor.getSecret()).toBe('totp-secret');

    expect(twoFactor.isEnabled()).toBe(false);

    expect(twoFactor.getEnabledAt()).toBeNull();

    expect(twoFactor.getCreatedAt()).toEqual(now);
  });

  it('should enable the 2FA configuration', () => {
    const now = new Date('2026-08-13T10:00:00.000Z');

    const clock: Clock = {
      now: jest.fn().mockReturnValue(now),
    };

    const twoFactor = TwoFactorAuthentication.create(
      {
        id: '2fa-id',
        userId: 'user-id',
        secret: 'totp-secret',
      },
      clock,
    );

    twoFactor.enable();

    expect(twoFactor.isEnabled()).toBe(true);

    expect(twoFactor.getEnabledAt()).toEqual(now);
  });

  it('should not enable an already enabled 2FA configuration', () => {
    const now = new Date('2026-08-13T10:00:00.000Z');

    const clock: Clock = {
      now: jest.fn().mockReturnValue(now),
    };

    const twoFactor = TwoFactorAuthentication.create(
      {
        id: '2fa-id',
        userId: 'user-id',
        secret: 'totp-secret',
      },
      clock,
    );

    twoFactor.enable();

    expect(() => {
      twoFactor.enable();
    }).toThrow('Two-factor authentication is already enabled');
  });

  it('should report whether 2FA is enabled', () => {
    const now = new Date('2026-08-13T10:00:00.000Z');

    const clock: Clock = {
      now: jest.fn().mockReturnValue(now),
    };

    const twoFactor = TwoFactorAuthentication.create(
      {
        id: '2fa-id',
        userId: 'user-id',
        secret: 'totp-secret',
      },
      clock,
    );

    expect(twoFactor.isEnabled()).toBe(false);

    twoFactor.enable();

    expect(twoFactor.isEnabled()).toBe(true);
  });
});
