import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { Device } from '../../domain/entities/device.entity';

import { DEVICE_REPOSITORY } from '../../domain/repositories/device.repository';

import type { DeviceRepository } from '../../domain/repositories/device.repository';

import { CLOCK } from '../../../shared/domain/clock';
import type { Clock } from '../../../shared/domain/clock';

export interface CreateDeviceInput {
  userId: string;
  name: string;
  userAgent: string;
  ipAddress: string;
}

export class CreateDeviceUseCase {
  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: DeviceRepository,

    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async execute(input: CreateDeviceInput): Promise<Device> {
    const device = Device.create(
      {
        id: randomUUID(),
        userId: input.userId,
        name: input.name,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
      },
      this.clock,
    );

    await this.deviceRepository.save(device);

    return device;
  }
}
