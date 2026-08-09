import { CreateSessionUseCase } from './create-session.use-case';
import { InMemorySessionRepository } from '../repositories/in-memory-session.repository';
import { FakeRefreshTokenGenerator } from '../services/fake-refresh-token-generator';
import { FakeClock } from '../../../shared/domain/fake-clock';
import { FakeTokenHasher } from '../services/fake-token-hasher';
import { FakeAccessTokenGenerator } from '../services/fake-access-token-generator';

describe('CreateSessionUseCase', () => {
  it('should create a session', async () => {
    const repository = new InMemorySessionRepository();
    const clock = new FakeClock(new Date('2026-08-05T10:00:00.000Z'));

    const tokenGenerator = new FakeRefreshTokenGenerator();
    const tokenHasher = new FakeTokenHasher();
    const accessTokenGenerator = new FakeAccessTokenGenerator();

    const useCase = new CreateSessionUseCase(
      repository,
      tokenGenerator,
      tokenHasher,
      clock,
      accessTokenGenerator,
    );

    const result = await useCase.execute({
      userId: 'user-id',
    });

    expect(result.refreshToken).toMatch(
      new RegExp(`^${result.session.getId()}\\.refresh-token(?:-\\d+)?$`),
    );

    expect(result.accessToken).toBe('access-token-user-id');

    expect(result.session.getUserId()).toBe('user-id');

    const storedSession = await repository.findById(result.session.getId());

    expect(storedSession).toBe(result.session);
    expect(result.session.getRefreshTokenHash()).toBe(
      `hashed-${result.refreshToken}`,
    );
  });
});
