import { PostgresSessionRepository } from './postgres-session.repository';
import { SessionOrmEntity } from '../entities/session.orm-entity';
import { Session } from '../../../domain/entities/session.entity';
import type { Clock } from '../../../../shared/domain/clock';

describe('PostgresSessionRepository', () => {
  let repository: PostgresSessionRepository;
  let ormRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let clock: Clock;

  beforeEach(() => {
    ormRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    clock = {
      now: jest.fn(() => new Date('2026-08-08T15:00:00.000Z')),
    };

    repository = new PostgresSessionRepository(
      ormRepository as any,
      clock,
    );
  });

  describe('findById', () => {
    it('should return a session when found', async () => {
      const entity: SessionOrmEntity = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        refreshTokenHash: 'refresh-token-hash',
        expiresAt: new Date('2026-08-09T15:00:00.000Z'),
        revokedAt: null,
        createdAt: new Date('2026-08-08T14:00:00.000Z'),
        updatedAt: new Date('2026-08-08T14:00:00.000Z'),
      };

      ormRepository.findOne.mockResolvedValue(entity);

      const result = await repository.findById(entity.id);

      expect(ormRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: entity.id,
        },
      });

      expect(result).toBeInstanceOf(Session);
      expect(result?.getId()).toBe(entity.id);
      expect(result?.getUserId()).toBe(entity.userId);
      expect(result?.getRefreshTokenHash()).toBe(entity.refreshTokenHash);
      expect(result?.getExpiresAt()).toEqual(entity.expiresAt);
      expect(result?.getRevokedAt()).toBeNull();
      expect(result?.getCreatedAt()).toEqual(entity.createdAt);
      expect(result?.getUpdatedAt()).toEqual(entity.updatedAt);
    });

    it('should return null when session is not found', async () => {
      ormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById(
        '550e8400-e29b-41d4-a716-446655440000',
      );

      expect(result).toBeNull();

      expect(ormRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
      });
    });
  });

  describe('save', () => {
    it('should persist the session', async () => {
      const session = Session.create(
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          userId: '550e8400-e29b-41d4-a716-446655440001',
          refreshTokenHash: 'refresh-token-hash',
          expiresAt: new Date('2026-08-09T15:00:00.000Z'),
        },
        clock,
      );

      ormRepository.save.mockResolvedValue(undefined);

      await repository.save(session);

      expect(ormRepository.save).toHaveBeenCalledWith({
        id: session.getId(),
        userId: session.getUserId(),
        refreshTokenHash: session.getRefreshTokenHash(),
        expiresAt: session.getExpiresAt(),
        revokedAt: session.getRevokedAt(),
        createdAt: session.getCreatedAt(),
        updatedAt: session.getUpdatedAt(),
      });
    });

    it('should persist a revoked session', async () => {
      const session = Session.create(
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          userId: '550e8400-e29b-41d4-a716-446655440001',
          refreshTokenHash: 'refresh-token-hash',
          expiresAt: new Date('2026-08-09T15:00:00.000Z'),
        },
        clock,
      );

      session.revoke(clock);

      ormRepository.save.mockResolvedValue(undefined);

      await repository.save(session);

      expect(ormRepository.save).toHaveBeenCalledWith({
        id: session.getId(),
        userId: session.getUserId(),
        refreshTokenHash: session.getRefreshTokenHash(),
        expiresAt: session.getExpiresAt(),
        revokedAt: session.getRevokedAt(),
        createdAt: session.getCreatedAt(),
        updatedAt: session.getUpdatedAt(),
      });
    });
  });
});
