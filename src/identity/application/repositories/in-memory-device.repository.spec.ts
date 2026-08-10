import { Device } from '../../domain/entities/device.entity';
import { FakeClock } from '../../../shared/domain/fake-clock';
import { InMemoryDeviceRepository } from './in-memory-device.repository';

describe('InMemoryDeviceRepository', () => {
  it('should save and find a device by id', async () => {
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

    const result = await repository.findById('device-id');

    expect(result).toBe(device);
  });

  it('should find devices by user id', async () => {
    const repository = new InMemoryDeviceRepository();

    const clock = new FakeClock(new Date('2026-08-10T10:00:00.000Z'));

    const deviceOne = Device.create(
      {
        id: 'device-one',
        userId: 'user-id',
        name: 'Chrome - Windows',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.0.10',
      },
      clock,
    );

    const deviceTwo = Device.create(
      {
        id: 'device-two',
        userId: 'user-id',
        name: 'Safari - iPhone',
        userAgent: 'Safari',
        ipAddress: '192.168.0.11',
      },
      clock,
    );

    const anotherUserDevice = Device.create(
      {
        id: 'device-three',
        userId: 'another-user-id',
        name: 'Firefox - Linux',
        userAgent: 'Firefox',
        ipAddress: '192.168.0.12',
      },
      clock,
    );

    await repository.save(deviceOne);
    await repository.save(deviceTwo);
    await repository.save(anotherUserDevice);

    const result = await repository.findByUserId('user-id');

    expect(result).toEqual([deviceOne, deviceTwo]);
  });

  it('should replace an existing device when saving with the same id', async () => {
    const repository = new InMemoryDeviceRepository();

    const clock = new FakeClock(new Date('2026-08-10T10:00:00.000Z'));

    const originalDevice = Device.create(
      {
        id: 'device-id',
        userId: 'user-id',
        name: 'Chrome - Windows',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.0.10',
      },
      clock,
    );

    await repository.save(originalDevice);

    clock.setNow(new Date('2026-08-10T11:00:00.000Z'));

    originalDevice.updateLastSeen();

    await repository.save(originalDevice);

    const result = await repository.findById('device-id');

    expect(result).toBe(originalDevice);
    expect(result?.getLastSeenAt()).toEqual(
      new Date('2026-08-10T11:00:00.000Z'),
    );
  });
});
