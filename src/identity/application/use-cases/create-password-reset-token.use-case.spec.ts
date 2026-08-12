import { CreatePasswordResetTokenUseCase } from './create-password-reset-token.use-case';

import { InMemoryPasswordResetTokenRepository } from '../repositories/in-memory-password-reset-token.repository';

import { Clock } from '../../../shared/domain/clock';

class FakeClock implements Clock {
  constructor(private currentDate: Date) {}

  now(): Date {
    return new Date(this.currentDate);
  }

  advance(milliseconds: number): void {
    this.currentDate = new Date(
      this.currentDate.getTime() + milliseconds,
    );
  }
}

describe('CreatePasswordResetTokenUseCase', () => {
  it('should create and persist a password reset token', async () => {
    const repository =
      new InMemoryPasswordResetTokenRepository();

    const tokenHasher = {
      hash: jest
        .fn()
        .mockResolvedValue('hashed-token'),

      compare: jest
        .fn()
        .mockResolvedValue(true),
    };

    const tokenGenerator = {
      generate: jest
        .fn()
        .mockResolvedValue('plain-token'),
    };

    const clock = new FakeClock(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    const useCase =
      new CreatePasswordResetTokenUseCase(
        repository,
        tokenHasher,
        tokenGenerator,
        clock,
      );

    const result = await useCase.execute({
      userId: 'user-id',
    });

    expect(result.token).toBe('plain-token');

    expect(
      tokenGenerator.generate,
    ).toHaveBeenCalled();

    expect(
      tokenHasher.hash,
    ).toHaveBeenCalledWith('plain-token');

    const savedToken =
      await repository.findByTokenHash(
        'hashed-token',
      );

    expect(savedToken).not.toBeNull();

    expect(
      savedToken?.getUserId(),
    ).toBe('user-id');

    expect(
      savedToken?.getTokenHash(),
    ).toBe('hashed-token');

    expect(
      savedToken?.getExpiresAt(),
    ).toEqual(
      new Date('2026-08-12T10:30:00.000Z'),
    );

    expect(
      savedToken?.isUsed(),
    ).toBe(false);
  });

  it('should create a new token on every execution', async () => {
    const repository =
      new InMemoryPasswordResetTokenRepository();

    const tokenHasher = {
      hash: jest
        .fn()
        .mockImplementation(
          async (token: string) =>
            `hash-${token}`,
        ),

      compare: jest
        .fn()
        .mockResolvedValue(true),
    };

    const tokenGenerator = {
      generate: jest
        .fn()
        .mockResolvedValueOnce('first-token')
        .mockResolvedValueOnce('second-token'),
    };

    const clock = new FakeClock(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    const useCase =
      new CreatePasswordResetTokenUseCase(
        repository,
        tokenHasher,
        tokenGenerator,
        clock,
      );

    const first = await useCase.execute({
      userId: 'user-id',
    });

    const second = await useCase.execute({
      userId: 'user-id',
    });

    expect(first.token).toBe('first-token');
    expect(second.token).toBe('second-token');

    expect(
      tokenGenerator.generate,
    ).toHaveBeenCalledTimes(2);

    expect(
      tokenHasher.hash,
    ).toHaveBeenCalledTimes(2);

    expect(
      tokenHasher.hash,
    ).toHaveBeenNthCalledWith(
      1,
      'first-token',
    );

    expect(
      tokenHasher.hash,
    ).toHaveBeenNthCalledWith(
      2,
      'second-token',
    );
  });
});
