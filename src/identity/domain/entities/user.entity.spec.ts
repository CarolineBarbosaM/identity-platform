import { User } from './user.entity';
import { UserStatus } from '../enums/user-status.enum';

describe('User', () => {
  describe('create', () => {
    it('should create a user with pending email verification status', () => {
      const user = User.create({
        id: 'user-id',
        name: 'Caroline',
        email: 'caroline@example.com',
      });

      expect(user.getStatus()).toBe(UserStatus.PENDING_EMAIL_VERIFICATION);
      expect(user.getEmailVerifiedAt()).toBeNull();
    });
  });

  describe('verifyEmail', () => {
    it('should activate the user after email verification', () => {
      const user = User.create({
        id: 'user-id',
        name: 'Caroline',
        email: 'caroline@example.com',
      });

      user.verifyEmail();

      expect(user.getStatus()).toBe(UserStatus.ACTIVE);
      expect(user.getEmailVerifiedAt()).not.toBeNull();
    });
  });
});