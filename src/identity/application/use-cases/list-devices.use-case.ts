import { Inject } from '@nestjs/common';

import { DEVICE_REPOSITORY } from '../../domain/repositories/device.repository';
import type { DeviceRepository } from '../../domain/repositories/device.repository';

import { Device } from '../../domain/entities/device.entity';

export interface ListDevicesInput {
  userId: string;
}

export class ListDevicesUseCase {
  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: DeviceRepository,
  ) {}

  async execute(input: ListDevicesInput): Promise<Device[]> {
    return this.deviceRepository.findByUserId(input.userId);
  }
}
