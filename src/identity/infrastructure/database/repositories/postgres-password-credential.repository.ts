import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PasswordCredential } from '../../../domain/entities/password-credential.entity';
import type { PasswordCredentialRepository } from '../../../domain/repositories/password-credential.repository';

import { PasswordCredentialOrmEntity } from '../entities/password-credential.orm-entity';

import { CLOCK } from '../../../../shared/domain/clock';
import type { Clock } from '../../../../shared/domain/clock';

@Injectable()
export class PostgresPasswordCredentialRepository implements PasswordCredentialRepository {
  constructor(
    @InjectRepository(PasswordCredentialOrmEntity)
    private readonly repository: Repository<PasswordCredentialOrmEntity>,

    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async findByUserId(userId: string): Promise<PasswordCredential | null> {
    const entity = await this.repository.findOne({
      where: {
        userId,
      },
    });

    if (!entity) {
      return null;
    }

    return PasswordCredential.rehydrate(
      {
        id: entity.id,
        userId: entity.userId,
        passwordHash: entity.passwordHash,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
      this.clock,
    );
  }

  async save(credential: PasswordCredential): Promise<void> {
    await this.repository.save({
      id: credential.getId(),
      userId: credential.getUserId(),
      passwordHash: credential.getPasswordHash(),
      createdAt: credential.getCreatedAt(),
      updatedAt: credential.getUpdatedAt(),
    });
  }
}
