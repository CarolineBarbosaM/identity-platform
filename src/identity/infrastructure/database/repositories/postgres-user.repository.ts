import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../../domain/entities/user.entity';
import type { UserRepository } from '../../../domain/repositories/user.repository';

import { UserOrmEntity } from '../entities/user.orm-entity';

import { CLOCK } from '../../../../shared/domain/clock';
import type { Clock } from '../../../../shared/domain/clock';

@Injectable()
export class PostgresUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,

    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: {
        id,
      },
    });

    if (!entity) {
      return null;
    }

    return User.rehydrate(
      {
        id: entity.id,
        name: entity.name,
        email: entity.email,
        status: entity.status,
        emailVerifiedAt: entity.emailVerifiedAt,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
      this.clock,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: {
        email,
      },
    });

    if (!entity) {
      return null;
    }

    return User.rehydrate(
      {
        id: entity.id,
        name: entity.name,
        email: entity.email,
        status: entity.status,
        emailVerifiedAt: entity.emailVerifiedAt,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
      this.clock,
    );
  }

  async save(user: User): Promise<void> {
    await this.repository.save({
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      status: user.getStatus(),
      emailVerifiedAt: user.getEmailVerifiedAt(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    });
  }
}
