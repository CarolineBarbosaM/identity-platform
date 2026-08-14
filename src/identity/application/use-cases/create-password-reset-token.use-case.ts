import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';

import { PASSWORD_RESET_TOKEN_REPOSITORY } from '../../domain/repositories/password-reset-token.repository';

import type { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';

import { TOKEN_HASHER } from '../../domain/services/token-hasher';

import type { TokenHasher } from '../../domain/services/token-hasher';

import { REFRESH_TOKEN_GENERATOR } from '../../domain/services/refresh-token-generator';

import type { RefreshTokenGenerator } from '../../domain/services/refresh-token-generator';

import { CLOCK } from '../../../shared/domain/clock';

import type { Clock } from '../../../shared/domain/clock';

export interface CreatePasswordResetTokenInput {
  userId: string;
}

export interface CreatePasswordResetTokenOutput {
  token: string;
}

export class CreatePasswordResetTokenUseCase {
  constructor(
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,

    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,

    @Inject(REFRESH_TOKEN_GENERATOR)
    private readonly tokenGenerator: RefreshTokenGenerator,

    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async execute(
    input: CreatePasswordResetTokenInput,
  ): Promise<CreatePasswordResetTokenOutput> {
    const token = await this.tokenGenerator.generate();

    const tokenHash = await this.tokenHasher.hash(token);

    const expiresAt = new Date(this.clock.now().getTime() + 30 * 60 * 1000);

    const passwordResetToken = PasswordResetToken.create(
      {
        id: randomUUID(),
        userId: input.userId,
        tokenHash,
        expiresAt,
      },
      this.clock,
    );

    await this.passwordResetTokenRepository.save(passwordResetToken);

    return {
      token,
    };
  }
}
