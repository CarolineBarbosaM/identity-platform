import { PostgresUserRepository } from './postgres-user.repository';
import { User } from '../../../domain/entities/user.entity';
import { FakeClock } from '../../../../shared/domain/fake-clock';

describe('PostgresUserRepository', () => {
  type Repository = ConstructorParameters<typeof PostgresUserRepository>[0];

  type StoredEntity = {
    id: string;
    name: string;
    email: string;
    status: ReturnType<User['getStatus']>;
    emailVerifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };

  const createRepository = () => {
    const storedEntities: StoredEntity[] = [];

    const repository = {
      save: jest.fn(async (entity: StoredEntity) => {
        const index = storedEntities.findIndex((item) => item.id === entity.id);

        if (index >= 0) {
          storedEntities[index] = entity;
        } else {
          storedEntities.push(entity);
        }

        return entity;
      }),

      findOne: jest.fn(
        async ({
          where,
        }: {
          where: {
            id?: string;
            email?: string;
          };
        }) => {
          return (
            storedEntities.find(
              (entity) =>
                entity.id === where.id || entity.email === where.email,
            ) ?? null
          );
        },
      ),
    } as unknown as Repository;

    const clock = new FakeClock(new Date('2026-08-12T10:00:00.000Z'));

    return {
      repository,
      clock,
      postgresRepository: new PostgresUserRepository(repository, clock),
    };
  };

  it('should save and find a user by id', async () => {
    const { repository, clock, postgresRepository } = createRepository();

    const user = User.create(
      {
        id: 'user-id',
        name: 'Caroline',
        email: 'caroline@example.com',
      },
      clock,
    );

    await postgresRepository.save(user);

    const result = await postgresRepository.findById('user-id');

    expect(repository.save).toHaveBeenCalledWith({
      id: 'user-id',
      name: 'Caroline',
      email: 'caroline@example.com',
      status: user.getStatus(),
      emailVerifiedAt: null,
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    });

    expect(result).not.toBeNull();
    expect(result?.getId()).toBe('user-id');
    expect(result?.getName()).toBe('Caroline');
    expect(result?.getEmail()).toBe('caroline@example.com');
    expect(result?.getStatus()).toBe(user.getStatus());
  });

  it('should return null when user does not exist by id', async () => {
    const { postgresRepository } = createRepository();

    const result = await postgresRepository.findById('unknown-user');

    expect(result).toBeNull();
  });

  it('should find a user by email', async () => {
    const { clock, postgresRepository } = createRepository();

    const user = User.create(
      {
        id: 'user-id',
        name: 'Caroline',
        email: 'caroline@example.com',
      },
      clock,
    );

    await postgresRepository.save(user);

    const result = await postgresRepository.findByEmail('caroline@example.com');

    expect(result).not.toBeNull();
    expect(result?.getId()).toBe('user-id');
  });

  it('should return null when user does not exist by email', async () => {
    const { postgresRepository } = createRepository();

    const result = await postgresRepository.findByEmail('unknown@example.com');

    expect(result).toBeNull();
  });

  it('should persist email verification', async () => {
    const { clock, postgresRepository } = createRepository();

    const user = User.create(
      {
        id: 'user-id',
        name: 'Caroline',
        email: 'caroline@example.com',
      },
      clock,
    );

    clock.setNow(new Date('2026-08-12T11:00:00.000Z'));

    user.verifyEmail();

    await postgresRepository.save(user);

    const result = await postgresRepository.findById('user-id');

    expect(result?.getEmailVerifiedAt()).toEqual(
      new Date('2026-08-12T11:00:00.000Z'),
    );
  });
});
