import { Device } from './device.entity';
import { FakeClock } from '../../../shared/domain/fake-clock';

describe('Device', () => {
  it('should create an active device', () => {
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

    expect(device.getId()).toBe('device-id');
    expect(device.getUserId()).toBe('user-id');
    expect(device.getName()).toBe('Chrome - Windows');
    expect(device.getUserAgent()).toBe('Mozilla/5.0');
    expect(device.getIpAddress()).toBe('192.168.0.10');

    expect(device.getCreatedAt()).toEqual(new Date('2026-08-10T10:00:00.000Z'));

    expect(device.getLastSeenAt()).toEqual(
      new Date('2026-08-10T10:00:00.000Z'),
    );

    expect(device.getRevokedAt()).toBeNull();
  });

  it('should update the last seen at', () => {
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

    clock.setNow(new Date('2026-08-10T10:01:00.000Z'));

    device.updateLastSeen();

    expect(device.getLastSeenAt()).toEqual(
      new Date('2026-08-10T10:01:00.000Z'),
    );
  });

  it('should revoke a device', () => {
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

    expect(device.getRevokedAt()).toBeNull();

    device.revoke();

    expect(device.getRevokedAt()).toEqual(new Date('2026-08-10T10:00:00.000Z'));
  });

  it('should not change revoked at when already revoked', () => {
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

    clock.setNow(new Date('2026-08-10T11:00:00.000Z'));

    device.revoke();

    expect(device.getRevokedAt()).toEqual(revokedAt);
  });
});
