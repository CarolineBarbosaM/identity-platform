import type { Redis } from 'ioredis';

import { RedisSsoStateStore } from './redis-sso-state-store';

describe('RedisSsoStateStore', () => {
  it('should save an SSO state with a TTL', async () => {
    const redis = {
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn(),
    } as unknown as Redis;

    const stateStore = new RedisSsoStateStore(redis);

    await stateStore.save('state-123');

    expect(redis.set).toHaveBeenCalledWith(
      'sso:state:state-123',
      '1',
      'EX',
      600,
    );
  });

  it('should return true when consuming an existing SSO state', async () => {
    const redis = {
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
    } as unknown as Redis;

    const stateStore = new RedisSsoStateStore(redis);

    const result = await stateStore.consume('state-123');

    expect(result).toBe(true);

    expect(redis.del).toHaveBeenCalledWith('sso:state:state-123');
  });

  it('should return false when consuming a non-existing SSO state', async () => {
    const redis = {
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(0),
    } as unknown as Redis;

    const stateStore = new RedisSsoStateStore(redis);

    const result = await stateStore.consume('state-123');

    expect(result).toBe(false);

    expect(redis.del).toHaveBeenCalledWith('sso:state:state-123');
  });

  it('should allow an SSO state to be consumed only once', async () => {
    const redis = {
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(0),
    } as unknown as Redis;

    const stateStore = new RedisSsoStateStore(redis);

    await stateStore.save('state-123');

    const firstConsume = await stateStore.consume('state-123');
    const secondConsume = await stateStore.consume('state-123');

    expect(firstConsume).toBe(true);
    expect(secondConsume).toBe(false);

    expect(redis.del).toHaveBeenNthCalledWith(1, 'sso:state:state-123');
    expect(redis.del).toHaveBeenNthCalledWith(2, 'sso:state:state-123');
  });
});
