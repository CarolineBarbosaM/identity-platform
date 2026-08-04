import { PasswordCredential } from './password-credential.entity';
import { FakeClock } from '../../../shared/domain/fake-clock';

const currentDate = new Date('2026-08-04T10:00:00.000Z');
const clock = new FakeClock(currentDate);

describe('PasswordCredential', () => {
  describe('create', () => {
    it('should create a password credential with a hashed password', () => {
      const credential = PasswordCredential.create(
        {
          id: 'credential-id',
          userId: 'user-id',
          passwordHash: '$argon2id$v=19$example-hash',
        },
        clock,
      );

      expect(credential.getId()).toBe('credential-id');
      expect(credential.getUserId()).toBe('user-id');
      expect(credential.getPasswordHash()).toBe(
        '$argon2id$v=19$example-hash',
      );
      expect(credential.getCreatedAt()).toBe(currentDate);
      expect(credential.getUpdatedAt()).toBe(currentDate);
    });
  });

  describe('changePassword', () => {
    it('should change the password hash', () => {
      const credential = PasswordCredential.create(
        {
          id: 'credential-id',
          userId: 'user-id',
          passwordHash: '$argon2id$v=19$old-hash',
        },
        clock,
      );

      credential.changePassword('$argon2id$v=19$new-hash');

      expect(credential.getPasswordHash()).toBe(
        '$argon2id$v=19$new-hash',
      );
    });
  });
});
