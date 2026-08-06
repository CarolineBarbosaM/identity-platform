import { InMemorySessionRepository } from './in-memory-session.repository';
import { Session } from '../../domain/entities/session.entity';
import { FakeClock } from '../../../shared/domain/fake-clock';

describe('InMemorySessionRepository', () => {
  it('should save and find a session', async () => {
    const repository = new InMemorySessionRepository();
    const clock = new FakeClock(
      new Date('2026-08-05T10:00:00.000Z'),
    );

    const session = Session.create(
      {
        id: 'session-id',
        userId: 'user-id',
        refreshTokenHash: 'refresh-hash',
        expiresAt: new Date('2026-09-04T10:00:00.000Z'),
      },
      clock,
    );

    await repository.save(session);

    const result = await repository.findById(
      'session-id',
    );

    expect(result).toBe(session);
  });
});
