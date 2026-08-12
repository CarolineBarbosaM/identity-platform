import { InMemoryEmailVerificationTokenRepository } from './in-memory-email-verification-token.repository';
import { EmailVerificationToken } from '../../domain/entities/email-verification-token.entity';
import { FakeClock } from '../../../shared/domain/fake-clock';

describe('InMemoryEmailVerificationTokenRepository', () => {
  it('should save and find a token by id', async () => {
    const repository =
      new InMemoryEmailVerificationTokenRepository();

    const clock = new FakeClock(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    const token = EmailVerificationToken.create(
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

    const result =
      await repository.findById('token-id');

    expect(result).toBe(token);
  });

  it('should return null when token does not exist by id', async () => {
    const repository =
      new InMemoryEmailVerificationTokenRepository();

    const result =
      await repository.findById('unknown-token');

    expect(result).toBeNull();
  });

  it('should find a token by user id', async () => {
    const repository =
      new InMemoryEmailVerificationTokenRepository();

    const clock = new FakeClock(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    const token = EmailVerificationToken.create(
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

    const result =
      await repository.findByUserId('user-id');

    expect(result).toBe(token);
  });

  it('should return null when token does not exist by user id', async () => {
    const repository =
      new InMemoryEmailVerificationTokenRepository();

    const result =
      await repository.findByUserId('unknown-user');

    expect(result).toBeNull();
  });

  it('should replace an existing token with the same id', async () => {
    const repository =
      new InMemoryEmailVerificationTokenRepository();

    const clock = new FakeClock(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    const firstToken =
      EmailVerificationToken.create(
        {
          id: 'token-id',
          userId: 'user-id',
          tokenHash: 'first-hash',
          expiresAt: new Date(
            '2026-08-12T11:00:00.000Z',
          ),
        },
        clock,
      );

    const secondToken =
      EmailVerificationToken.create(
        {
          id: 'token-id',
          userId: 'user-id',
          tokenHash: 'second-hash',
          expiresAt: new Date(
            '2026-08-12T12:00:00.000Z',
          ),
        },
        clock,
      );

    await repository.save(firstToken);
    await repository.save(secondToken);

    const result =
      await repository.findById('token-id');

    expect(result).toBe(secondToken);
  });
});
