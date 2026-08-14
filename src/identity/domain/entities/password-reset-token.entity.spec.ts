import { PasswordResetToken } from './password-reset-token.entity';
import { Clock } from '../../../shared/domain/clock';

class FakeClock implements Clock {
  constructor(private currentDate: Date) {}

  now(): Date {
    return new Date(this.currentDate);
  }

  advance(milliseconds: number): void {
    this.currentDate = new Date(this.currentDate.getTime() + milliseconds);
  }
}

describe('PasswordResetToken', () => {
  const initialDate = new Date('2026-08-12T10:00:00.000Z');

  it('should create a password reset token', () => {
    const clock = new FakeClock(initialDate);

    const expiresAt = new Date('2026-08-12T10:30:00.000Z');

    const token = PasswordResetToken.create(
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
    expect(token.getCreatedAt()).toEqual(initialDate);
    expect(token.getUsedAt()).toBeNull();
    expect(token.isUsed()).toBe(false);
    expect(token.isExpired()).toBe(false);
  });

  it('should identify an expired token', () => {
    const clock = new FakeClock(initialDate);

    const token = PasswordResetToken.create(
      {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date('2026-08-12T10:30:00.000Z'),
      },
      clock,
    );

    clock.advance(30 * 60 * 1000);

    expect(token.isExpired()).toBe(true);
  });

  it('should consume a valid token', () => {
    const clock = new FakeClock(initialDate);

    const token = PasswordResetToken.create(
      {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date('2026-08-12T10:30:00.000Z'),
      },
      clock,
    );

    clock.advance(10 * 60 * 1000);

    token.consume();

    expect(token.isUsed()).toBe(true);
    expect(token.getUsedAt()).toEqual(new Date('2026-08-12T10:10:00.000Z'));
  });

  it('should not consume an expired token', () => {
    const clock = new FakeClock(initialDate);

    const token = PasswordResetToken.create(
      {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date('2026-08-12T10:30:00.000Z'),
      },
      clock,
    );

    clock.advance(30 * 60 * 1000);

    expect(() => token.consume()).toThrow('Password reset token has expired');

    expect(token.isUsed()).toBe(false);
  });

  it('should not consume a token twice', () => {
    const clock = new FakeClock(initialDate);

    const token = PasswordResetToken.create(
      {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date('2026-08-12T10:30:00.000Z'),
      },
      clock,
    );

    token.consume();

    expect(() => token.consume()).toThrow(
      'Password reset token has already been used',
    );
  });

  it('should rehydrate an existing token', () => {
    const clock = new FakeClock(initialDate);

    const createdAt = new Date('2026-08-12T09:00:00.000Z');

    const expiresAt = new Date('2026-08-12T10:30:00.000Z');

    const usedAt = new Date('2026-08-12T10:10:00.000Z');

    const token = PasswordResetToken.rehydrate(
      {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt,
        createdAt,
        usedAt,
      },
      clock,
    );

    expect(token.getId()).toBe('token-id');
    expect(token.getUserId()).toBe('user-id');
    expect(token.getTokenHash()).toBe('hashed-token');
    expect(token.getExpiresAt()).toEqual(expiresAt);
    expect(token.getCreatedAt()).toEqual(createdAt);
    expect(token.getUsedAt()).toEqual(usedAt);
    expect(token.isUsed()).toBe(true);
  });
});
