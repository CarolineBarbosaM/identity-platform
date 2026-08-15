import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '../../../database/redis.module';
import type Redis from 'ioredis';

import type { SsoStateStore } from '../../domain/services/sso-state-store';

@Injectable()
export class RedisSsoStateStore implements SsoStateStore {
  private readonly stateTtlInSeconds = 600;

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async save(state: string): Promise<void> {
    await this.redis.set(this.getKey(state), '1', 'EX', this.stateTtlInSeconds);
  }

  async consume(state: string): Promise<boolean> {
    const key = this.getKey(state);

    const deleted = await this.redis.del(key);

    return deleted === 1;
  }

  private getKey(state: string): string {
    return `sso:state:${state}`;
  }
}
