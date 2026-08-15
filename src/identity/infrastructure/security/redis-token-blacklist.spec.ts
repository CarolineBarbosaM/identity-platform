import { RedisTokenBlacklist } from './redis-token-blacklist';

describe('RedisTokenBlacklist', () => {
  const createRedisMock = () => {
    const redis = {
      set: jest.fn(),
      exists: jest.fn(),
    };

    return redis;
  };

  it('should add a token to the blacklist with the remaining TTL', async () => {
    const redis = createRedisMock();

    redis.set.mockResolvedValue('OK');

    const blacklist = new RedisTokenBlacklist(
      redis as unknown as ConstructorParameters<typeof RedisTokenBlacklist>[0],
    );

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
    const redis = createRedisMock();

    const blacklist = new RedisTokenBlacklist(
      redis as unknown as ConstructorParameters<typeof RedisTokenBlacklist>[0],
    );

    const expiresAt = new Date(Date.now() - 1_000);

    await blacklist.add('token-id', expiresAt);

    expect(redis.set).not.toHaveBeenCalled();
  });

  it('should return true when the token is blacklisted', async () => {
    const redis = createRedisMock();

    redis.exists.mockResolvedValue(1);

    const blacklist = new RedisTokenBlacklist(
      redis as unknown as ConstructorParameters<typeof RedisTokenBlacklist>[0],
    );

    const result = await blacklist.has('token-id');

    expect(result).toBe(true);

    expect(redis.exists).toHaveBeenCalledWith('token:blacklist:token-id');
  });

  it('should return false when the token is not blacklisted', async () => {
    const redis = createRedisMock();

    redis.exists.mockResolvedValue(0);

    const blacklist = new RedisTokenBlacklist(
      redis as unknown as ConstructorParameters<typeof RedisTokenBlacklist>[0],
    );

    const result = await blacklist.has('token-id');

    expect(result).toBe(false);

    expect(redis.exists).toHaveBeenCalledWith('token:blacklist:token-id');
  });
});
