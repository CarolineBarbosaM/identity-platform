import { Argon2TokenHasher } from './argon2-token-hasher';

describe('Argon2TokenHasher', () => {
  it('should hash and compare a token', async () => {
    const hasher = new Argon2TokenHasher();

    const hash = await hasher.hash('refresh-token');

    const valid = await hasher.compare('refresh-token', hash);

    expect(valid).toBe(true);
  });
});
