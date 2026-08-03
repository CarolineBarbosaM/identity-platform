import { User } from './user.entity';
import { UserStatus } from '../enums/user-status.enum';
import { FakeClock } from '../../../shared/domain/fake-clock';

const currentDate = new Date('2026-08-03T10:00:00.000Z');
const clock = new FakeClock(currentDate);

describe('User', () => {
  describe('create', () => {
    it('should create a user with pending email verification status', () => {
      const user = User.create({
        id: 'user-id',
        name: 'Caroline',
        email: 'caroline@example.com',
      }, clock);

      expect(user.getStatus()).toBe(UserStatus.PENDING_EMAIL_VERIFICATION);
      expect(user.getEmailVerifiedAt()).toBeNull();
      expect(user.getCreatedAt()).toBe(currentDate);
      expect(user.getUpdatedAt()).toBe(currentDate);
    });
  });

  describe('verifyEmail', () => {
    it('should activate the user after email verification', () => {
      const user = User.create({
        id: 'user-id',
        name: 'Caroline',
        email: 'caroline@example.com',
      }, clock);

      user.verifyEmail();

      expect(user.getStatus()).toBe(UserStatus.ACTIVE);
      expect(user.getEmailVerifiedAt()).not.toBeNull();
      expect(user.getEmailVerifiedAt()).toBe(currentDate);
      expect(user.getUpdatedAt()).toBe(currentDate);
    });

    it('should not verify an already verified email', () => {
      const user = User.create({
        id: 'user-id',
        name: 'Caroline',
        email: 'caroline@example.com',
      }, clock);

      user.verifyEmail();

      expect(() => user.verifyEmail()).toThrow(
        'User email cannot be verified in the current state',
      );
    });
  });
});

describe('suspend', () => {
  it('should suspend an active user', () => {
    const user = User.create({
      id: 'user-id',
      name: 'Caroline',
      email: 'caroline@example.com',
    }, clock);

    user.verifyEmail();
    user.suspend();

    expect(user.getStatus()).toBe(UserStatus.SUSPENDED);
  });

  it('should reactivate a suspended user', () => {
    const user = User.create({
      id: 'user-id',
      name: 'Caroline',
      email: 'caroline@example.com',
    }, clock);

    user.verifyEmail();
    user.suspend();

    user.reactivate();

    expect(user.getStatus()).toBe(UserStatus.ACTIVE);
  });

  it('should not reactivate an active user', () => {
    const user = User.create({
      id: 'user-id',
      name: 'Caroline',
      email: 'caroline@example.com',
    }, clock);

    user.verifyEmail();

    expect(() => user.reactivate()).toThrow(
      'User cannot be reactivated in the current state',
    );
  });
});

describe('lock', () => {
  it('should lock an active user', () => {
    const user = User.create({
      id: 'user-id',
      name: 'Caroline',
      email: 'caroline@example.com',
    }, clock);

    user.verifyEmail();
    user.lock();

    expect(user.getStatus()).toBe(UserStatus.LOCKED);
  });
});