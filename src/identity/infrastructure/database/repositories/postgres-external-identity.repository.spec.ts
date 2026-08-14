import { PostgresExternalIdentityRepository } from './postgres-external-identity.repository';

import { ExternalIdentity } from '../../../domain/entities/external-identity.entity';

describe('PostgresExternalIdentityRepository', () => {
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
              entity.provider === where.provider &&
              entity.providerUserId === where.providerUserId,
          ) ?? null
        );
      }),

      find: jest.fn(async ({ where }) => {
        return storedEntities.filter(
          (entity) => entity.userId === where.userId,
        );
      }),
    } as any;

    return {
      repository,
      postgresRepository: new PostgresExternalIdentityRepository(repository),
    };
  };

  it('should save and find an external identity by provider and provider user id', async () => {
    const { repository, postgresRepository } = createRepository();

    const externalIdentity = ExternalIdentity.create({
      id: 'external-identity-id',
      userId: 'user-id',
      provider: 'google',
      providerUserId: 'google-user-id',
      email: 'caroline@example.com',
    });

    await postgresRepository.save(externalIdentity);

    const result = await postgresRepository.findByProviderAndProviderUserId(
      'google',
      'google-user-id',
    );

    expect(repository.save).toHaveBeenCalledWith({
      id: 'external-identity-id',
      userId: 'user-id',
      provider: 'google',
      providerUserId: 'google-user-id',
      email: 'caroline@example.com',
    });

    expect(result).not.toBeNull();
    expect(result?.getId()).toBe('external-identity-id');
    expect(result?.getUserId()).toBe('user-id');
    expect(result?.getProvider()).toBe('google');
    expect(result?.getProviderUserId()).toBe('google-user-id');
    expect(result?.getEmail()).toBe('caroline@example.com');
  });

  it('should return null when external identity does not exist', async () => {
    const { postgresRepository } = createRepository();

    const result = await postgresRepository.findByProviderAndProviderUserId(
      'google',
      'unknown-google-user-id',
    );

    expect(result).toBeNull();
  });

  it('should find all external identities by user id', async () => {
    const { postgresRepository } = createRepository();

    const googleIdentity = ExternalIdentity.create({
      id: 'google-identity-id',
      userId: 'user-id',
      provider: 'google',
      providerUserId: 'google-user-id',
      email: 'caroline@example.com',
    });

    const microsoftIdentity = ExternalIdentity.create({
      id: 'microsoft-identity-id',
      userId: 'user-id',
      provider: 'microsoft',
      providerUserId: 'microsoft-user-id',
      email: 'caroline@example.com',
    });

    const otherUserIdentity = ExternalIdentity.create({
      id: 'other-identity-id',
      userId: 'other-user-id',
      provider: 'google',
      providerUserId: 'other-google-user-id',
      email: 'other@example.com',
    });

    await postgresRepository.save(googleIdentity);

    await postgresRepository.save(microsoftIdentity);

    await postgresRepository.save(otherUserIdentity);

    const result = await postgresRepository.findByUserId('user-id');

    expect(result).toHaveLength(2);

    expect(result.map((identity) => identity.getProvider())).toEqual(
      expect.arrayContaining(['google', 'microsoft']),
    );
  });

  it('should update an existing external identity', async () => {
    const { repository, postgresRepository } = createRepository();

    const externalIdentity = ExternalIdentity.create({
      id: 'external-identity-id',
      userId: 'user-id',
      provider: 'google',
      providerUserId: 'google-user-id',
      email: 'old@example.com',
    });

    await postgresRepository.save(externalIdentity);

    const updatedIdentity = ExternalIdentity.create({
      id: 'external-identity-id',
      userId: 'user-id',
      provider: 'google',
      providerUserId: 'google-user-id',
      email: 'new@example.com',
    });

    await postgresRepository.save(updatedIdentity);

    const result = await postgresRepository.findByProviderAndProviderUserId(
      'google',
      'google-user-id',
    );

    expect(repository.save).toHaveBeenCalledTimes(2);

    expect(result?.getEmail()).toBe('new@example.com');
  });
});
