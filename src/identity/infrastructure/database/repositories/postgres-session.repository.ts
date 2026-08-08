import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Session } from '../../../domain/entities/session.entity';
import type { SessionRepository } from '../../../domain/repositories/session.repository';

import { SessionOrmEntity } from '../entities/session.orm-entity';

import { CLOCK } from '../../../../shared/domain/clock';
import type { Clock } from '../../../../shared/domain/clock';

@Injectable()
export class PostgresSessionRepository implements SessionRepository {
  constructor(
    @InjectRepository(SessionOrmEntity)
    private readonly repository: Repository<SessionOrmEntity>,

    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<Session | null> {
    const entity = await this.repository.findOne({
      where: {
        id,
      },
    });

    if (!entity) {
      return null;
    }

    return Session.rehydrate(
      {
        id: entity.id,
        userId: entity.userId,
        refreshTokenHash: entity.refreshTokenHash,
        expiresAt: entity.expiresAt,
        revokedAt: entity.revokedAt,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
      this.clock,
    );
  }

  async save(session: Session): Promise<void> {
    await this.repository.save({
      id: session.getId(),
      userId: session.getUserId(),
      refreshTokenHash: session.getRefreshTokenHash(),
      expiresAt: session.getExpiresAt(),
      revokedAt: session.getRevokedAt(),
      createdAt: session.getCreatedAt(),
      updatedAt: session.getUpdatedAt(),
    });
  }
}
