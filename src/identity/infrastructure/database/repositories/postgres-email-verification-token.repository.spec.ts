import { PostgresEmailVerificationTokenRepository } from './postgres-email-verification-token.repository';
import { EmailVerificationToken } from '../../../domain/entities/email-verification-token.entity';
import { FakeClock } from '../../../../shared/domain/fake-clock';

describe('PostgresEmailVerificationTokenRepository', () => {
  const createRepository = () => {
    const storedEntities: any[] = [];

    const repository = {
      save: jest.fn(async (entity) => {
        const index = storedEntities.findIndex((item) => item.id === entity.id);

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
            (entity) =>
              entity.id === where.id || entity.userId === where.userId,
          ) ?? null
        );
      }),
    } as any;

    const clock = new FakeClock(new Date('2026-08-12T10:00:00.000Z'));

    return {
      repository,
      clock,
      postgresRepository: new PostgresEmailVerificationTokenRepository(
        repository,
        clock,
      ),
    };
  };

  it('should save and find a token by id', async () => {
    const { repository, clock, postgresRepository } = createRepository();

    const token = EmailVerificationToken.create(
      {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date('2026-08-12T11:00:00.000Z'),
      },
      clock,
    );

    await postgresRepository.save(token);

    const result = await postgresRepository.findById('token-id');

    expect(repository.save).toHaveBeenCalledWith({
      id: 'token-id',
      userId: 'user-id',
      tokenHash: 'hashed-token',
      expiresAt: new Date('2026-08-12T11:00:00.000Z'),
      createdAt: token.getCreatedAt(),
      updatedAt: token.getUpdatedAt(),
      usedAt: null,
    });

    expect(result).not.toBeNull();
    expect(result?.getId()).toBe('token-id');
    expect(result?.getUserId()).toBe('user-id');
    expect(result?.getTokenHash()).toBe('hashed-token');
  });

  it('should return null when token does not exist', async () => {
    const { postgresRepository } = createRepository();

    const result = await postgresRepository.findById('unknown-token');

    expect(result).toBeNull();
  });

  it('should find a token by user id', async () => {
    const { clock, postgresRepository } = createRepository();

    const token = EmailVerificationToken.create(
      {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date('2026-08-12T11:00:00.000Z'),
      },
      clock,
    );

    await postgresRepository.save(token);

    const result = await postgresRepository.findByUserId('user-id');

    expect(result).not.toBeNull();
    expect(result?.getId()).toBe('token-id');
  });

  it('should persist a used token', async () => {
    const { clock, postgresRepository } = createRepository();

    const token = EmailVerificationToken.create(
      {
        id: 'token-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date('2026-08-12T11:00:00.000Z'),
      },
      clock,
    );

    clock.setNow(new Date('2026-08-12T10:30:00.000Z'));

    token.markAsUsed();

    await postgresRepository.save(token);

    const result = await postgresRepository.findById('token-id');

    expect(result?.isUsed()).toBe(true);
    expect(result?.getUsedAt()).toEqual(new Date('2026-08-12T10:30:00.000Z'));
  });
});
