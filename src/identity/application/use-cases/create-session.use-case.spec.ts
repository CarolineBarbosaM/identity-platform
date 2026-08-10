import { CreateSessionUseCase } from './create-session.use-case';
import { InMemorySessionRepository } from '../repositories/in-memory-session.repository';
import { InMemoryDeviceRepository } from '../repositories/in-memory-device.repository';
import { FakeRefreshTokenGenerator } from '../services/fake-refresh-token-generator';
import { FakeClock } from '../../../shared/domain/fake-clock';
import { FakeTokenHasher } from '../services/fake-token-hasher';
import { FakeAccessTokenGenerator } from '../services/fake-access-token-generator';

describe('CreateSessionUseCase', () => {
  it('should create a session and device', async () => {
    const sessionRepository =
      new InMemorySessionRepository();

    const deviceRepository =
      new InMemoryDeviceRepository();

    const clock = new FakeClock(
      new Date('2026-08-05T10:00:00.000Z'),
    );

    const tokenGenerator =
      new FakeRefreshTokenGenerator();

    const tokenHasher = new FakeTokenHasher();

    const accessTokenGenerator =
      new FakeAccessTokenGenerator();

    const useCase = new CreateSessionUseCase(
      sessionRepository,
      deviceRepository,
      tokenGenerator,
      tokenHasher,
      clock,
      accessTokenGenerator,
    );

    const result = await useCase.execute({
      userId: 'user-id',
      deviceName: 'Chrome - Windows',
      userAgent: 'Mozilla/5.0',
      ipAddress: '192.168.0.10',
    });

    expect(result.refreshToken).toMatch(
      new RegExp(
        `^${result.session.getId()}\\.refresh-token(?:-\\d+)?$`,
      ),
    );

    expect(result.accessToken).toBe(
      'access-token-user-id',
    );

    expect(result.session.getUserId()).toBe(
      'user-id',
    );

    expect(result.device.getUserId()).toBe(
      'user-id',
    );

    expect(result.device.getName()).toBe(
      'Chrome - Windows',
    );

    expect(result.device.getUserAgent()).toBe(
      'Mozilla/5.0',
    );

    expect(result.device.getIpAddress()).toBe(
      '192.168.0.10',
    );

    const storedSession =
      await sessionRepository.findById(
        result.session.getId(),
      );

    expect(storedSession).toBe(result.session);

    expect(
      result.session.getRefreshTokenHash(),
    ).toBe(
      `hashed-${result.refreshToken}`,
    );

    const storedDevice =
      await deviceRepository.findById(
        result.device.getId(),
      );

    expect(storedDevice).toBe(result.device);
  });
});
