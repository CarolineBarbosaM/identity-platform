import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '../../../database/redis.module';
import type Redis from 'ioredis';

import type { TokenBlacklist } from '../../domain/services/token-blacklist';

@Injectable()
export class RedisTokenBlacklist implements TokenBlacklist {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async add(tokenId: string, expiresAt: Date): Promise<void> {
    const ttl = Math.max(
      0,
      Math.ceil((expiresAt.getTime() - Date.now()) / 1000),
    );

    if (ttl <= 0) {
      return;
    }

    await this.redis.set(this.getKey(tokenId), '1', 'EX', ttl);
  }

  async has(tokenId: string): Promise<boolean> {
    const exists = await this.redis.exists(this.getKey(tokenId));

    return exists === 1;
  }

  private getKey(tokenId: string): string {
    return `token:blacklist:${tokenId}`;
  }
}
