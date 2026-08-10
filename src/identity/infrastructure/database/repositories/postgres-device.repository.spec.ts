import { PostgresDeviceRepository } from './postgres-device.repository';
import { Device } from '../../../domain/entities/device.entity';
import { FakeClock } from '../../../../shared/domain/fake-clock';

describe('PostgresDeviceRepository', () => {
  const createRepository = () => {
    const storedEntities: any[] = [];

    const repository = {
      save: jest.fn(async (entity) => {
        const index = storedEntities.findIndex(
          (item) => item.id === entity.id,
        );

        if (index >= 0) {
          storedEntities[index] = entity;
        } else {
          storedEntities.push(entity);
        }

        return entity;
      }),

      findOne: jest.fn(async ({ where }) => {
        return (
          storedEntities.find(
            (entity) => entity.id === where.id,
          ) ?? null
        );
      }),

      find: jest.fn(async ({ where }) => {
        return storedEntities.filter(
          (entity) => entity.userId === where.userId,
        );
      }),
    } as any;

    const clock = new FakeClock(
      new Date('2026-08-10T10:00:00.000Z'),
    );

    return {
      repository,
      clock,
      postgresRepository: new PostgresDeviceRepository(
        repository,
        clock,
      ),
    };
  };

  it('should save and find a device by id', async () => {
    const {
      repository,
      clock,
      postgresRepository,
    } = createRepository();

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

    await postgresRepository.save(device);

    const result = await postgresRepository.findById(
      'device-id',
    );

    expect(repository.save).toHaveBeenCalledWith({
      id: 'device-id',
      userId: 'user-id',
      name: 'Chrome - Windows',
      userAgent: 'Mozilla/5.0',
      ipAddress: '192.168.0.10',
      createdAt: device.getCreatedAt(),
      lastSeenAt: device.getLastSeenAt(),
      revokedAt: null,
    });

    expect(result).not.toBeNull();
    expect(result?.getId()).toBe('device-id');
    expect(result?.getUserId()).toBe('user-id');
    expect(result?.getName()).toBe('Chrome - Windows');
    expect(result?.getUserAgent()).toBe('Mozilla/5.0');
    expect(result?.getIpAddress()).toBe('192.168.0.10');
    expect(result?.getCreatedAt()).toEqual(
      device.getCreatedAt(),
    );
    expect(result?.getLastSeenAt()).toEqual(
      device.getLastSeenAt(),
    );
    expect(result?.getRevokedAt()).toBeNull();
  });

  it('should return null when device does not exist', async () => {
    const { repository, postgresRepository } =
      createRepository();

    const result =
      await postgresRepository.findById('unknown-device');

    expect(repository.findOne).toHaveBeenCalledWith({
      where: {
        id: 'unknown-device',
      },
    });

    expect(result).toBeNull();
  });

  it('should find devices by user id', async () => {
    const {
      repository,
      clock,
      postgresRepository,
    } = createRepository();

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
        userAgent: 'Mobile Safari',
        ipAddress: '192.168.0.11',
      },
      clock,
    );

    const otherUserDevice = Device.create(
      {
        id: 'device-three',
        userId: 'another-user-id',
        name: 'Firefox - Linux',
        userAgent: 'Mozilla/5.0 Firefox',
        ipAddress: '192.168.0.12',
      },
      clock,
    );

    await postgresRepository.save(deviceOne);
    await postgresRepository.save(deviceTwo);
    await postgresRepository.save(otherUserDevice);

    const result =
      await postgresRepository.findByUserId('user-id');

    expect(repository.find).toHaveBeenCalledWith({
      where: {
        userId: 'user-id',
      },
    });

    expect(result).toHaveLength(2);

    expect(
      result.map((device) => device.getId()),
    ).toEqual([
      'device-one',
      'device-two',
    ]);

    expect(
      result.every(
        (device) => device.getUserId() === 'user-id',
      ),
    ).toBe(true);
  });

  it('should return an empty array when user has no devices', async () => {
    const { repository, postgresRepository } =
      createRepository();

    const result =
      await postgresRepository.findByUserId(
        'user-without-devices',
      );

    expect(repository.find).toHaveBeenCalledWith({
      where: {
        userId: 'user-without-devices',
      },
    });

    expect(result).toEqual([]);
  });

  it('should update an existing device when saving it again', async () => {
    const {
      clock,
      postgresRepository,
    } = createRepository();

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

    await postgresRepository.save(device);

    clock.setNow(
      new Date('2026-08-10T11:00:00.000Z'),
    );

    device.updateLastSeen();

    await postgresRepository.save(device);

    const result =
      await postgresRepository.findById('device-id');

    expect(result?.getLastSeenAt()).toEqual(
      new Date('2026-08-10T11:00:00.000Z'),
    );
  });

  it('should persist a revoked device', async () => {
    const {
      clock,
      postgresRepository,
    } = createRepository();

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

    await postgresRepository.save(device);

    const result =
      await postgresRepository.findById('device-id');

    expect(result?.getRevokedAt()).toEqual(
      new Date('2026-08-10T10:00:00.000Z'),
    );
  });
});
