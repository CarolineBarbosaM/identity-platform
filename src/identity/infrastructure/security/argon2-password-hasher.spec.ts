import { Argon2PasswordHasher } from './argon2-password-hasher';

describe('Argon2PasswordHasher', () => {
  it('should hash and verify a password', async () => {
    const hasher = new Argon2PasswordHasher();

    const password = 'StrongPassword123!';
    const hash = await hasher.hash(password);

    expect(hash).not.toBe(password);
    expect(await hasher.compare(password, hash)).toBe(true);
    expect(await hasher.compare('WrongPassword123!', hash)).toBe(false);
  });
});
