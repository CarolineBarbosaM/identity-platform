import { InMemoryUserRepository } from './in-memory-user.repository';
import { User } from '../../domain/entities/user.entity';
import { FakeClock } from '../../../shared/domain/fake-clock';

describe('InMemoryUserRepository', () => {
  it('should save and find a user by id', async () => {
    const repository = new InMemoryUserRepository();

    const clock = new FakeClock(new Date('2026-08-12T10:00:00.000Z'));

    const user = User.create(
      {
        id: 'user-id',
        name: 'Caroline',
        email: 'caroline@example.com',
      },
      clock,
    );

    await repository.save(user);

    const result = await repository.findById('user-id');

    expect(result).toBe(user);
  });

  it('should return null when user does not exist by id', async () => {
    const repository = new InMemoryUserRepository();

    const result = await repository.findById('unknown-user');

    expect(result).toBeNull();
  });

  it('should find a user by email', async () => {
    const repository = new InMemoryUserRepository();

    const clock = new FakeClock(new Date('2026-08-12T10:00:00.000Z'));

    const user = User.create(
      {
        id: 'user-id',
        name: 'Caroline',
        email: 'caroline@example.com',
      },
      clock,
    );

    await repository.save(user);

    const result = await repository.findByEmail('caroline@example.com');

    expect(result).toBe(user);
  });

  it('should return null when user does not exist by email', async () => {
    const repository = new InMemoryUserRepository();

    const result = await repository.findByEmail('unknown@example.com');

    expect(result).toBeNull();
  });
});
