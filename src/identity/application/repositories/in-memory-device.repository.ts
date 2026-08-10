import { Device } from '../../domain/entities/device.entity';
import type { DeviceRepository } from '../../domain/repositories/device.repository';

export class InMemoryDeviceRepository implements DeviceRepository {
  private readonly devices: Device[] = [];

  async findById(id: string): Promise<Device | null> {
    return this.devices.find((device) => device.getId() === id) ?? null;
  }

  async findByUserId(userId: string): Promise<Device[]> {
    return this.devices.filter((device) => device.getUserId() === userId);
  }

  async save(device: Device): Promise<void> {
    const index = this.devices.findIndex(
      (item) => item.getId() === device.getId(),
    );

    if (index >= 0) {
      this.devices[index] = device;
      return;
    }

    this.devices.push(device);
  }
}
