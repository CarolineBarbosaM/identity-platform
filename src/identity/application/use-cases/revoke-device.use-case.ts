import { Inject } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';

import { DEVICE_REPOSITORY } from '../../domain/repositories/device.repository';
import type { DeviceRepository } from '../../domain/repositories/device.repository';

import { CLOCK } from '../../../shared/domain/clock';
import type { Clock } from '../../../shared/domain/clock';

export interface RevokeDeviceInput {
  deviceId: string;
  userId: string;
}

export class RevokeDeviceUseCase {
  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: DeviceRepository,

    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async execute(input: RevokeDeviceInput): Promise<void> {
    const device = await this.deviceRepository.findById(input.deviceId);

    if (!device) {
      throw new UnauthorizedException();
    }

    if (device.getUserId() !== input.userId) {
      throw new UnauthorizedException();
    }

    if (device.getRevokedAt()) {
      return;
    }

    device.revoke();

    await this.deviceRepository.save(device);
  }
}
