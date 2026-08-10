import { RedisTokenBlacklist } from './redis-token-blacklist';

describe('RedisTokenBlacklist', () => {
  it('should add a token to the blacklist with the remaining TTL', async () => {
    const redis = {
      set: jest.fn().mockResolvedValue('OK'),
      exists: jest.fn(),
    };

    const blacklist = new RedisTokenBlacklist(redis as any);

    const expiresAt = new Date(Date.now() + 60_000);

    await blacklist.add('token-id', expiresAt);

    expect(redis.set).toHaveBeenCalledWith(
      'token:blacklist:token-id',
      '1',
      'EX',
      expect.any(Number),
    );
  });

  it('should not add an already expired token', async () => {
    const redis = {
      set: jest.fn(),
      exists: jest.fn(),
    };

    const blacklist = new RedisTokenBlacklist(redis as any);

    const expiresAt = new Date(Date.now() - 1_000);

    await blacklist.add('token-id', expiresAt);

    expect(redis.set).not.toHaveBeenCalled();
  });

  it('should return true when the token is blacklisted', async () => {
    const redis = {
      set: jest.fn(),
      exists: jest.fn().mockResolvedValue(1),
    };

    const blacklist = new RedisTokenBlacklist(redis as any);

    const result = await blacklist.has('token-id');

    expect(result).toBe(true);

    expect(redis.exists).toHaveBeenCalledWith('token:blacklist:token-id');
  });

  it('should return false when the token is not blacklisted', async () => {
    const redis = {
      set: jest.fn(),
      exists: jest.fn().mockResolvedValue(0),
    };

    const blacklist = new RedisTokenBlacklist(redis as any);

    const result = await blacklist.has('token-id');

    expect(result).toBe(false);

    expect(redis.exists).toHaveBeenCalledWith('token:blacklist:token-id');
  });
});
