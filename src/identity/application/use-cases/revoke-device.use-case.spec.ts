import { RevokeDeviceUseCase } from './revoke-device.use-case';
import { InMemoryDeviceRepository } from '../repositories/in-memory-device.repository';
import { FakeClock } from '../../../shared/domain/fake-clock';
import { Device } from '../../domain/entities/device.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('RevokeDeviceUseCase', () => {
  it('should revoke a device', async () => {
    const repository = new InMemoryDeviceRepository();

    const clock = new FakeClock(new Date('2026-08-10T10:00:00.000Z'));

    const device = Device.create(
      {
        id: 'device-id',
        userId: 'user-id',
        name: 'Chrome - Windows',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.0.10',
      },
      clock,
    );

    await repository.save(device);

    const useCase = new RevokeDeviceUseCase(repository, clock);

    await useCase.execute({
      deviceId: 'device-id',
      userId: 'user-id',
    });

    expect(device.getRevokedAt()).toEqual(new Date('2026-08-10T10:00:00.000Z'));

    const storedDevice = await repository.findById('device-id');

    expect(storedDevice).toBe(device);
    expect(storedDevice?.getRevokedAt()).toEqual(
      new Date('2026-08-10T10:00:00.000Z'),
    );
  });

  it('should reject when device does not exist', async () => {
    const repository = new InMemoryDeviceRepository();

    const clock = new FakeClock(new Date('2026-08-10T10:00:00.000Z'));

    const useCase = new RevokeDeviceUseCase(repository, clock);

    await expect(
      useCase.execute({
        deviceId: 'unknown-device',
        userId: 'user-id',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject when device belongs to another user', async () => {
    const repository = new InMemoryDeviceRepository();

    const clock = new FakeClock(new Date('2026-08-10T10:00:00.000Z'));

    const device = Device.create(
      {
        id: 'device-id',
        userId: 'owner-user-id',
        name: 'Chrome - Windows',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.0.10',
      },
      clock,
    );

    await repository.save(device);

    const useCase = new RevokeDeviceUseCase(repository, clock);

    await expect(
      useCase.execute({
        deviceId: 'device-id',
        userId: 'another-user-id',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(device.getRevokedAt()).toBeNull();
  });

  it('should do nothing when device is already revoked', async () => {
    const repository = new InMemoryDeviceRepository();

    const clock = new FakeClock(new Date('2026-08-10T10:00:00.000Z'));

    const device = Device.create(
      {
        id: 'device-id',
        userId: 'user-id',
        name: 'Chrome - Windows',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.0.10',
      },
      clock,
    );

    device.revoke();

    const revokedAt = device.getRevokedAt();

    await repository.save(device);

    clock.setNow(new Date('2026-08-10T11:00:00.000Z'));

    const useCase = new RevokeDeviceUseCase(repository, clock);

    await useCase.execute({
      deviceId: 'device-id',
      userId: 'user-id',
    });

    expect(device.getRevokedAt()).toEqual(revokedAt);
  });
});
