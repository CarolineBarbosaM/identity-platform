import { Session } from './session.entity';
import { FakeClock } from '../../../shared/domain/fake-clock';

describe('Session', () => {
  const currentDate = new Date('2026-08-05T10:00:00.000Z');
  const clock = new FakeClock(currentDate);

  describe('create', () => {
    it('should create a session', () => {
        const session = Session.create(
            {
            id: 'session-id',
            userId: 'user-id',
            refreshTokenHash: 'refresh-token-hash',
            expiresAt: new Date('2026-09-04T10:00:00.000Z'),
            },
            clock,
        );

        expect(session.getId()).toBe('session-id');
        expect(session.getUserId()).toBe('user-id');
        expect(session.getRefreshTokenHash()).toBe('refresh-token-hash');
        expect(session.getExpiresAt()).toEqual(
            new Date('2026-09-04T10:00:00.000Z'),
        );
        expect(session.getRevokedAt()).toBeNull();
        expect(session.getCreatedAt()).toBe(currentDate);
        expect(session.getUpdatedAt()).toBe(currentDate);
    });
  });

  describe('revoke', () => {
    it('should revoke the session', () => {
        const session = Session.create(
            {
            id: 'session-id',
            userId: 'user-id',
            refreshTokenHash: 'refresh-token-hash',
            expiresAt: new Date('2026-09-04T10:00:00.000Z'),
            },
            clock,
        );

        const revokedAt = new Date('2026-08-05T11:00:00.000Z');

        clock.setNow(revokedAt);

        session.revoke(clock);

        expect(session.getRevokedAt()).toBe(revokedAt);
        expect(session.getUpdatedAt()).toBe(revokedAt);
    });
  });
});