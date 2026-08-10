import { CreateDeviceUseCase } from './create-device.use-case';
import { InMemoryDeviceRepository } from '../repositories/in-memory-device.repository';
import { FakeClock } from '../../../shared/domain/fake-clock';

describe('CreateDeviceUseCase', () => {
  it('should create and save a device', async () => {
    const repository = new InMemoryDeviceRepository();

    const clock = new FakeClock(new Date('2026-08-10T10:00:00.000Z'));

    const useCase = new CreateDeviceUseCase(repository, clock);

    const result = await useCase.execute({
      userId: 'user-id',
      name: 'Chrome - Windows',
      userAgent: 'Mozilla/5.0',
      ipAddress: '192.168.0.10',
    });

    expect(result.getId()).toMatch(/^[0-9a-f-]{36}$/);

    expect(result.getUserId()).toBe('user-id');
    expect(result.getName()).toBe('Chrome - Windows');
    expect(result.getUserAgent()).toBe('Mozilla/5.0');
    expect(result.getIpAddress()).toBe('192.168.0.10');

    expect(result.getRevokedAt()).toBeNull();

    const storedDevice = await repository.findById(result.getId());

    expect(storedDevice).toBe(result);
  });
});
