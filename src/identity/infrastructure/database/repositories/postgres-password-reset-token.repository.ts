import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PasswordResetToken } from '../../../domain/entities/password-reset-token.entity';

import type { PasswordResetTokenRepository } from '../../../domain/repositories/password-reset-token.repository';

import { PasswordResetTokenOrmEntity } from '../entities/password-reset-token.orm-entity';

import { CLOCK } from '../../../../shared/domain/clock';
import type { Clock } from '../../../../shared/domain/clock';

@Injectable()
export class PostgresPasswordResetTokenRepository implements PasswordResetTokenRepository {
  constructor(
    @InjectRepository(PasswordResetTokenOrmEntity)
    private readonly repository: Repository<PasswordResetTokenOrmEntity>,

    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async findByUserId(userId: string): Promise<PasswordResetToken | null> {
    const entity = await this.repository.findOne({
      where: {
        userId,
      },
    });

    if (!entity) {
      return null;
    }

    return PasswordResetToken.rehydrate(
      {
        id: entity.id,
        userId: entity.userId,
        tokenHash: entity.tokenHash,
        expiresAt: entity.expiresAt,
        createdAt: entity.createdAt,
        usedAt: entity.usedAt,
      },
      this.clock,
    );
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const entity = await this.repository.findOne({
      where: {
        tokenHash,
      },
    });

    if (!entity) {
      return null;
    }

    return PasswordResetToken.rehydrate(
      {
        id: entity.id,
        userId: entity.userId,
        tokenHash: entity.tokenHash,
        expiresAt: entity.expiresAt,
        createdAt: entity.createdAt,
        usedAt: entity.usedAt,
      },
      this.clock,
    );
  }

  async save(token: PasswordResetToken): Promise<void> {
    await this.repository.save({
      id: token.getId(),
      userId: token.getUserId(),
      tokenHash: token.getTokenHash(),
      expiresAt: token.getExpiresAt(),
      createdAt: token.getCreatedAt(),
      usedAt: token.getUsedAt(),
    });
  }
}
