import { EmailVerificationToken } from './email-verification-token.entity';
import { FakeClock } from '../../../shared/domain/fake-clock';

describe('EmailVerificationToken', () => {
  it('should create an unused token', () => {
    const clock = new FakeClock(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    const expiresAt = new Date(
      '2026-08-12T11:00:00.000Z',
    );

    const token = EmailVerificationToken.create(
      {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt,
      },
      clock,
    );

    expect(token.getId()).toBe('token-id');
    expect(token.getUserId()).toBe('user-id');
    expect(token.getTokenHash()).toBe('hashed-token');
    expect(token.getExpiresAt()).toEqual(expiresAt);
    expect(token.getUsedAt()).toBeNull();
    expect(token.isUsed()).toBe(false);
    expect(token.isExpired()).toBe(false);
  });

  it('should detect an expired token', () => {
    const clock = new FakeClock(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    const token = EmailVerificationToken.create(
      {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date(
          '2026-08-12T11:00:00.000Z',
        ),
      },
      clock,
    );

    clock.setNow(
      new Date('2026-08-12T11:00:00.000Z'),
    );

    expect(token.isExpired()).toBe(true);
  });

  it('should mark the token as used', () => {
    const clock = new FakeClock(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    const token = EmailVerificationToken.create(
      {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date(
          '2026-08-12T11:00:00.000Z',
        ),
      },
      clock,
    );

    clock.setNow(
      new Date('2026-08-12T10:30:00.000Z'),
    );

    token.markAsUsed();

    expect(token.isUsed()).toBe(true);
    expect(token.getUsedAt()).toEqual(
      new Date('2026-08-12T10:30:00.000Z'),
    );
    expect(token.getUpdatedAt()).toEqual(
      new Date('2026-08-12T10:30:00.000Z'),
    );
  });

  it('should not change the used date when already used', () => {
    const clock = new FakeClock(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    const token = EmailVerificationToken.create(
      {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date(
          '2026-08-12T11:00:00.000Z',
        ),
      },
      clock,
    );

    clock.setNow(
      new Date('2026-08-12T10:30:00.000Z'),
    );

    token.markAsUsed();

    clock.setNow(
      new Date('2026-08-12T10:45:00.000Z'),
    );

    token.markAsUsed();

    expect(token.getUsedAt()).toEqual(
      new Date('2026-08-12T10:30:00.000Z'),
    );
  });

  it('should rehydrate a token', () => {
    const clock = new FakeClock(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    const token = EmailVerificationToken.rehydrate(
      {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date(
          '2026-08-12T11:00:00.000Z',
        ),
        createdAt: new Date(
          '2026-08-12T09:00:00.000Z',
        ),
        updatedAt: new Date(
          '2026-08-12T09:30:00.000Z',
        ),
        usedAt: null,
      },
      clock,
    );

    expect(token.getId()).toBe('token-id');
    expect(token.getUserId()).toBe('user-id');
    expect(token.getTokenHash()).toBe('hashed-token');
    expect(token.getUsedAt()).toBeNull();
    expect(token.getCreatedAt()).toEqual(
      new Date('2026-08-12T09:00:00.000Z'),
    );
    expect(token.getUpdatedAt()).toEqual(
      new Date('2026-08-12T09:30:00.000Z'),
    );
  });
});
