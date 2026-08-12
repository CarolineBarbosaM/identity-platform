import { ResetPasswordUseCase } from './reset-password.use-case';

import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';

import { InMemoryPasswordResetTokenRepository } from '../repositories/in-memory-password-reset-token.repository';

import { InMemoryPasswordCredentialRepository } from '../repositories/in-memory-password-credential.repository';

import { PasswordCredential } from '../../domain/entities/password-credential.entity';

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

describe('ResetPasswordUseCase', () => {
  it('should reset the user password', async () => {
    const clock = new FakeClock(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    const tokenRepository =
      new InMemoryPasswordResetTokenRepository();

    const credentialRepository =
      new InMemoryPasswordCredentialRepository();

    const tokenHasher = {
      hash: jest.fn(),
      compare: jest
        .fn()
        .mockResolvedValue(true),
    };

    const passwordHasher = {
      hash: jest
        .fn()
        .mockResolvedValue(
          'new-password-hash',
        ),
      compare: jest.fn(),
    };

    const credential =
      PasswordCredential.create(
        {
          id: 'credential-id',
          userId: 'user-id',
          passwordHash: 'old-password-hash',
        },
        clock,
      );

    await credentialRepository.save(
      credential,
    );

    const resetToken =
      PasswordResetToken.create(
        {
          id: 'reset-token-id',
          userId: 'user-id',
          tokenHash: 'hashed-reset-token',
          expiresAt: new Date(
            '2026-08-12T10:30:00.000Z',
          ),
        },
        clock,
      );

    await tokenRepository.save(
      resetToken,
    );

    const useCase =
      new ResetPasswordUseCase(
        tokenRepository,
        credentialRepository,
        passwordHasher,
        tokenHasher,
      );

    await useCase.execute({
      userId: 'user-id',
      token: 'plain-reset-token',
      newPassword: 'new-password',
    });

    expect(
      tokenHasher.compare,
    ).toHaveBeenCalledWith(
      'plain-reset-token',
      'hashed-reset-token',
    );

    expect(
      passwordHasher.hash,
    ).toHaveBeenCalledWith(
      'new-password',
    );

    const updatedCredential =
      await credentialRepository.findByUserId(
        'user-id',
      );

    expect(
      updatedCredential?.getPasswordHash(),
    ).toBe('new-password-hash');

    expect(
      resetToken.isUsed(),
    ).toBe(true);
  });

  it('should reject an invalid token', async () => {
    const clock = new FakeClock(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    const tokenRepository =
      new InMemoryPasswordResetTokenRepository();

    const credentialRepository =
      new InMemoryPasswordCredentialRepository();

    const tokenHasher = {
      hash: jest.fn(),
      compare: jest
        .fn()
        .mockResolvedValue(false),
    };

    const passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const resetToken =
      PasswordResetToken.create(
        {
          id: 'reset-token-id',
          userId: 'user-id',
          tokenHash: 'hashed-reset-token',
          expiresAt: new Date(
            '2026-08-12T10:30:00.000Z',
          ),
        },
        clock,
      );

    await tokenRepository.save(
      resetToken,
    );

    const useCase =
      new ResetPasswordUseCase(
        tokenRepository,
        credentialRepository,
        passwordHasher,
        tokenHasher,
      );

    await expect(
      useCase.execute({
        userId: 'user-id',
        token: 'wrong-token',
        newPassword: 'new-password',
      }),
    ).rejects.toThrow(
      'Invalid password reset token',
    );

    expect(
      passwordHasher.hash,
    ).not.toHaveBeenCalled();
  });

  it('should reject an expired token', async () => {
    const clock = new FakeClock(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    const tokenRepository =
      new InMemoryPasswordResetTokenRepository();

    const credentialRepository =
      new InMemoryPasswordCredentialRepository();

    const tokenHasher = {
      hash: jest.fn(),
      compare: jest
        .fn()
        .mockResolvedValue(true),
    };

    const passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const resetToken =
      PasswordResetToken.create(
        {
          id: 'reset-token-id',
          userId: 'user-id',
          tokenHash: 'hashed-reset-token',
          expiresAt: new Date(
            '2026-08-12T10:30:00.000Z',
          ),
        },
        clock,
      );

    await tokenRepository.save(
      resetToken,
    );

    clock.advance(
      30 * 60 * 1000,
    );

    const useCase =
      new ResetPasswordUseCase(
        tokenRepository,
        credentialRepository,
        passwordHasher,
        tokenHasher,
      );

    await expect(
      useCase.execute({
        userId: 'user-id',
        token: 'plain-reset-token',
        newPassword: 'new-password',
      }),
    ).rejects.toThrow(
      'Password reset token has expired',
    );

    expect(
      passwordHasher.hash,
    ).not.toHaveBeenCalled();
  });

  it('should reject a used token', async () => {
    const clock = new FakeClock(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    const tokenRepository =
      new InMemoryPasswordResetTokenRepository();

    const credentialRepository =
      new InMemoryPasswordCredentialRepository();

    const tokenHasher = {
      hash: jest.fn(),
      compare: jest
        .fn()
        .mockResolvedValue(true),
    };

    const passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const resetToken =
      PasswordResetToken.create(
        {
          id: 'reset-token-id',
          userId: 'user-id',
          tokenHash: 'hashed-reset-token',
          expiresAt: new Date(
            '2026-08-12T10:30:00.000Z',
          ),
        },
        clock,
      );

    resetToken.consume();

    await tokenRepository.save(
      resetToken,
    );

    const useCase =
      new ResetPasswordUseCase(
        tokenRepository,
        credentialRepository,
        passwordHasher,
        tokenHasher,
      );

    await expect(
      useCase.execute({
        userId: 'user-id',
        token: 'plain-reset-token',
        newPassword: 'new-password',
      }),
    ).rejects.toThrow(
      'Password reset token has already been used',
    );

    expect(
      passwordHasher.hash,
    ).not.toHaveBeenCalled();
  });

  it('should reject when password credential does not exist', async () => {
    const clock = new FakeClock(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    const tokenRepository =
      new InMemoryPasswordResetTokenRepository();

    const credentialRepository =
      new InMemoryPasswordCredentialRepository();

    const tokenHasher = {
      hash: jest.fn(),
      compare: jest
        .fn()
        .mockResolvedValue(true),
    };

    const passwordHasher = {
      hash: jest
        .fn()
        .mockResolvedValue(
          'new-password-hash',
        ),
      compare: jest.fn(),
    };

    const resetToken =
      PasswordResetToken.create(
        {
          id: 'reset-token-id',
          userId: 'user-id',
          tokenHash: 'hashed-reset-token',
          expiresAt: new Date(
            '2026-08-12T10:30:00.000Z',
          ),
        },
        clock,
      );

    await tokenRepository.save(
      resetToken,
    );

    const useCase =
      new ResetPasswordUseCase(
        tokenRepository,
        credentialRepository,
        passwordHasher,
        tokenHasher,
      );

    await expect(
      useCase.execute({
        userId: 'user-id',
        token: 'plain-reset-token',
        newPassword: 'new-password',
      }),
    ).rejects.toThrow(
      'Password credential not found',
    );
  });
});
