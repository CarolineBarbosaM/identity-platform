import { InMemoryTokenBlacklist } from './in-memory-token-blacklist';

describe('InMemoryTokenBlacklist', () => {
  it('should consider a token revoked after adding it', async () => {
    const blacklist = new InMemoryTokenBlacklist();

    const expiresAt = new Date(Date.now() + 60_000);

    await blacklist.add('token-123', expiresAt);

    await expect(blacklist.has('token-123')).resolves.toBe(true);
  });

  it('should return false for a token that was not revoked', async () => {
    const blacklist = new InMemoryTokenBlacklist();

    await expect(blacklist.has('token-123')).resolves.toBe(false);
  });

  it('should return false after the blacklist entry expires', async () => {
    const blacklist = new InMemoryTokenBlacklist();

    const expiresAt = new Date(Date.now() - 1_000);

    await blacklist.add('token-123', expiresAt);

    await expect(blacklist.has('token-123')).resolves.toBe(false);
  });
});
