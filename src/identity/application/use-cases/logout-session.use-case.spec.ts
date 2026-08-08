import { LogoutSessionUseCase } from './logout-session.use-case';
import { InMemorySessionRepository } from '../repositories/in-memory-session.repository';
import { FakeClock } from '../../../shared/domain/fake-clock';
import { Session } from '../../domain/entities/session.entity';

describe('LogoutSessionUseCase', () => {
  it('should revoke a session', async () => {
    const repository = new InMemorySessionRepository();

    const clock = new FakeClock(new Date('2026-08-05T10:00:00.000Z'));

    const session = Session.create(
      {
        id: 'session-id',
        userId: 'user-id',
        refreshTokenHash: 'hashed-refresh-token',
        expiresAt: new Date('2026-09-05T10:00:00.000Z'),
      },
      clock,
    );

    await repository.save(session);

    const useCase = new LogoutSessionUseCase(repository, clock);

    await useCase.execute({
      sessionId: 'session-id',
    });

    expect(session.getRevokedAt()).toEqual(
      new Date('2026-08-05T10:00:00.000Z'),
    );
  });
});
