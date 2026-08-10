import { Device } from '../entities/device.entity';

export interface DeviceRepository {
  findById(id: string): Promise<Device | null>;
  findByUserId(userId: string): Promise<Device[]>;
  save(device: Device): Promise<void>;
}

export const DEVICE_REPOSITORY = Symbol('DEVICE_REPOSITORY');
