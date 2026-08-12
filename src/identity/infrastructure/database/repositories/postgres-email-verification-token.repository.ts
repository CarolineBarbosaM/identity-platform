import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmailVerificationToken } from '../../../domain/entities/email-verification-token.entity';
import type { EmailVerificationTokenRepository } from '../../../domain/repositories/email-verification-token.repository';

import { EmailVerificationTokenOrmEntity } from '../entities/email-verification-token.orm-entity';

import { CLOCK } from '../../../../shared/domain/clock';
import type { Clock } from '../../../../shared/domain/clock';

@Injectable()
export class PostgresEmailVerificationTokenRepository
  implements EmailVerificationTokenRepository
{
  constructor(
    @InjectRepository(EmailVerificationTokenOrmEntity)
    private readonly repository: Repository<EmailVerificationTokenOrmEntity>,

    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async findById(
    id: string,
  ): Promise<EmailVerificationToken | null> {
    const entity = await this.repository.findOne({
      where: {
        id,
      },
    });

    if (!entity) {
      return null;
    }

    return EmailVerificationToken.rehydrate(
      {
        id: entity.id,
        userId: entity.userId,
        tokenHash: entity.tokenHash,
        expiresAt: entity.expiresAt,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        usedAt: entity.usedAt,
      },
      this.clock,
    );
  }

  async findByUserId(
    userId: string,
  ): Promise<EmailVerificationToken | null> {
    const entity = await this.repository.findOne({
      where: {
        userId,
      },
    });

    if (!entity) {
      return null;
    }

    return EmailVerificationToken.rehydrate(
      {
        id: entity.id,
        userId: entity.userId,
        tokenHash: entity.tokenHash,
        expiresAt: entity.expiresAt,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        usedAt: entity.usedAt,
      },
      this.clock,
    );
  }

  async save(
    token: EmailVerificationToken,
  ): Promise<void> {
    await this.repository.save({
      id: token.getId(),
      userId: token.getUserId(),
      tokenHash: token.getTokenHash(),
      expiresAt: token.getExpiresAt(),
      createdAt: token.getCreatedAt(),
      updatedAt: token.getUpdatedAt(),
      usedAt: token.getUsedAt(),
    });
  }
}
