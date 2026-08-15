import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TwoFactorAuthentication } from '../../../domain/entities/two-factor-authentication.entity';

import type { TwoFactorAuthenticationRepository } from '../../../domain/repositories/two-factor-authentication.repository';

import { TwoFactorAuthenticationOrmEntity } from '../entities/two-factor-authentication.orm-entity';

import { CLOCK } from '../../../../shared/domain/clock';

import type { Clock } from '../../../../shared/domain/clock';

@Injectable()
export class PostgresTwoFactorAuthenticationRepository implements TwoFactorAuthenticationRepository {
  constructor(
    @InjectRepository(TwoFactorAuthenticationOrmEntity)
    private readonly repository: Repository<TwoFactorAuthenticationOrmEntity>,

    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async findByUserId(userId: string): Promise<TwoFactorAuthentication | null> {
    const entity = await this.repository.findOne({
      where: {
        userId,
      },
    });

    if (!entity) {
      return null;
    }

    const twoFactor = TwoFactorAuthentication.create(
      {
        id: entity.id,
        userId: entity.userId,
        secret: entity.secret,
      },
      this.clock,
    );

    if (entity.enabledAt) {
      twoFactor.enable();
    }

    return twoFactor;
  }

  async save(twoFactorAuthentication: TwoFactorAuthentication): Promise<void> {
    await this.repository.save({
      id: twoFactorAuthentication.getId(),
      userId: twoFactorAuthentication.getUserId(),
      secret: twoFactorAuthentication.getSecret(),
      createdAt: twoFactorAuthentication.getCreatedAt(),
      enabledAt: twoFactorAuthentication.getEnabledAt(),
    });
  }
}
