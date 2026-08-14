import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ExternalIdentity } from '../../../domain/entities/external-identity.entity';
import type { ExternalIdentityRepository } from '../../../domain/repositories/external-identity.repository';

import { ExternalIdentityOrmEntity } from '../entities/external-identity.orm-entity';

@Injectable()
export class PostgresExternalIdentityRepository implements ExternalIdentityRepository {
  constructor(
    @InjectRepository(ExternalIdentityOrmEntity)
    private readonly repository: Repository<ExternalIdentityOrmEntity>,
  ) {}

  async findByProviderAndProviderUserId(
    provider: string,
    providerUserId: string,
  ): Promise<ExternalIdentity | null> {
    const entity = await this.repository.findOne({
      where: {
        provider,
        providerUserId,
      },
    });

    if (!entity) {
      return null;
    }

    return ExternalIdentity.create({
      id: entity.id,
      userId: entity.userId,
      provider: entity.provider,
      providerUserId: entity.providerUserId,
      email: entity.email,
    });
  }

  async findByUserId(userId: string): Promise<ExternalIdentity[]> {
    const entities = await this.repository.find({
      where: {
        userId,
      },
    });

    return entities.map((entity) =>
      ExternalIdentity.create({
        id: entity.id,
        userId: entity.userId,
        provider: entity.provider,
        providerUserId: entity.providerUserId,
        email: entity.email,
      }),
    );
  }

  async save(externalIdentity: ExternalIdentity): Promise<void> {
    await this.repository.save({
      id: externalIdentity.getId(),
      userId: externalIdentity.getUserId(),
      provider: externalIdentity.getProvider(),
      providerUserId: externalIdentity.getProviderUserId(),
      email: externalIdentity.getEmail(),
    });
  }
}
