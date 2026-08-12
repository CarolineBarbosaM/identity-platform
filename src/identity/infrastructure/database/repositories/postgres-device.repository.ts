import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Device } from '../../../domain/entities/device.entity';
import type { DeviceRepository } from '../../../domain/repositories/device.repository';

import { DeviceOrmEntity } from '../entities/device.orm-entity';

import { CLOCK } from '../../../../shared/domain/clock';
import type { Clock } from '../../../../shared/domain/clock';

@Injectable()
export class PostgresDeviceRepository implements DeviceRepository {
  constructor(
    @InjectRepository(DeviceOrmEntity)
    private readonly repository: Repository<DeviceOrmEntity>,

    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<Device | null> {
    const entity = await this.repository.findOne({
      where: {
        id,
      },
    });

    if (!entity) {
      return null;
    }

    return Device.rehydrate(
      {
        id: entity.id,
        userId: entity.userId,
        name: entity.name,
        userAgent: entity.userAgent,
        ipAddress: entity.ipAddress,
        createdAt: entity.createdAt,
        lastSeenAt: entity.lastSeenAt,
        revokedAt: entity.revokedAt,
      },
      this.clock,
    );
  }

  async findByUserId(userId: string): Promise<Device[]> {
    const entities = await this.repository.find({
      where: {
        userId,
      },
    });

    return entities.map((entity) =>
      Device.rehydrate(
        {
          id: entity.id,
          userId: entity.userId,
          name: entity.name,
          userAgent: entity.userAgent,
          ipAddress: entity.ipAddress,
          createdAt: entity.createdAt,
          lastSeenAt: entity.lastSeenAt,
          revokedAt: entity.revokedAt,
        },
        this.clock,
      ),
    );
  }

  async save(device: Device): Promise<void> {
    await this.repository.save({
      id: device.getId(),
      userId: device.getUserId(),
      name: device.getName(),
      userAgent: device.getUserAgent(),
      ipAddress: device.getIpAddress(),
      createdAt: device.getCreatedAt(),
      lastSeenAt: device.getLastSeenAt(),
      revokedAt: device.getRevokedAt(),
    });
  }
}
