import { ListDevicesUseCase } from './list-devices.use-case';
import { InMemoryDeviceRepository } from '../repositories/in-memory-device.repository';
import { FakeClock } from '../../../shared/domain/fake-clock';
import { Device } from '../../domain/entities/device.entity';

describe('ListDevicesUseCase', () => {
  it('should list devices from a user', async () => {
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

    await repository.save(deviceOne);
    await repository.save(deviceTwo);

    const useCase = new ListDevicesUseCase(repository);

    const result = await useCase.execute({
      userId: 'user-id',
    });

    expect(result).toEqual([deviceOne, deviceTwo]);
  });
});
