import { PasswordResetToken } from '../../../domain/entities/password-reset-token.entity';
import { PostgresPasswordResetTokenRepository } from './postgres-password-reset-token.repository';

import { PasswordResetTokenOrmEntity } from '../entities/password-reset-token.orm-entity';

import { Clock } from '../../../../shared/domain/clock';

describe('PostgresPasswordResetTokenRepository', () => {
  const createRepository = () => {
    const typeOrmRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const clock: Clock = {
      now: jest.fn().mockReturnValue(
        new Date('2026-08-12T10:00:00.000Z'),
      ),
    };

    const repository =
      new PostgresPasswordResetTokenRepository(
        typeOrmRepository as any,
        clock,
      );

    return {
      repository,
      typeOrmRepository,
    };
  };

  it('should find a password reset token by user id', async () => {
    const {
      repository,
      typeOrmRepository,
    } = createRepository();

    const entity: PasswordResetTokenOrmEntity = {
      id: 'token-id',
      userId: 'user-id',
      tokenHash: 'hashed-token',
      expiresAt: new Date(
        '2026-08-12T11:00:00.000Z',
      ),
      createdAt: new Date(
        '2026-08-12T10:00:00.000Z',
      ),
      usedAt: null,
    };

    typeOrmRepository.findOne.mockResolvedValue(
      entity,
    );

    const result =
      await repository.findByUserId('user-id');

    expect(
      typeOrmRepository.findOne,
    ).toHaveBeenCalledWith({
      where: {
        userId: 'user-id',
      },
    });

    expect(result).toBeInstanceOf(
      PasswordResetToken,
    );

    expect(result?.getId()).toBe('token-id');
    expect(result?.getUserId()).toBe('user-id');
    expect(result?.getTokenHash()).toBe(
      'hashed-token',
    );
    expect(result?.getUsedAt()).toBeNull();
  });

  it('should find a password reset token by token hash', async () => {
    const {
      repository,
      typeOrmRepository,
    } = createRepository();

    const entity: PasswordResetTokenOrmEntity = {
      id: 'token-id',
      userId: 'user-id',
      tokenHash: 'hashed-token',
      expiresAt: new Date(
        '2026-08-12T11:00:00.000Z',
      ),
      createdAt: new Date(
        '2026-08-12T10:00:00.000Z',
      ),
      usedAt: null,
    };

    typeOrmRepository.findOne.mockResolvedValue(
      entity,
    );

    const result =
      await repository.findByTokenHash(
        'hashed-token',
      );

    expect(
      typeOrmRepository.findOne,
    ).toHaveBeenCalledWith({
      where: {
        tokenHash: 'hashed-token',
      },
    });

    expect(result).toBeInstanceOf(
      PasswordResetToken,
    );

    expect(result?.getTokenHash()).toBe(
      'hashed-token',
    );
  });

  it('should return null when token does not exist', async () => {
    const {
      repository,
      typeOrmRepository,
    } = createRepository();

    typeOrmRepository.findOne.mockResolvedValue(
      null,
    );

    const result =
      await repository.findByTokenHash(
        'unknown-token',
      );

    expect(result).toBeNull();
  });

  it('should save a password reset token', async () => {
    const {
      repository,
      typeOrmRepository,
    } = createRepository();

    const clock: Clock = {
      now: jest.fn().mockReturnValue(
        new Date('2026-08-12T10:00:00.000Z'),
      ),
    };

    const token =
      PasswordResetToken.create(
        {
          id: 'token-id',
          userId: 'user-id',
          tokenHash: 'hashed-token',
          expiresAt: new Date(
            '2026-08-12T11:00:00.000Z',
          ),
        },
        clock,
      );

    await repository.save(token);

    expect(
      typeOrmRepository.save,
    ).toHaveBeenCalledWith({
      id: 'token-id',
      userId: 'user-id',
      tokenHash: 'hashed-token',
      expiresAt: new Date(
        '2026-08-12T11:00:00.000Z',
      ),
      createdAt: new Date(
        '2026-08-12T10:00:00.000Z',
      ),
      usedAt: null,
    });
  });
});
