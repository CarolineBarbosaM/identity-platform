import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { EmailVerificationToken } from '../../domain/entities/email-verification-token.entity';

import { EMAIL_VERIFICATION_TOKEN_REPOSITORY } from '../../domain/repositories/email-verification-token.repository';

import type { EmailVerificationTokenRepository } from '../../domain/repositories/email-verification-token.repository';

import { TOKEN_HASHER } from '../../domain/services/token-hasher';

import type { TokenHasher } from '../../domain/services/token-hasher';

import { CLOCK } from '../../../shared/domain/clock';

import type { Clock } from '../../../shared/domain/clock';

export interface CreateEmailVerificationTokenInput {
  userId: string;
}

export interface CreateEmailVerificationTokenOutput {
  token: string;
}

export class CreateEmailVerificationTokenUseCase {
  constructor(
    @Inject(EMAIL_VERIFICATION_TOKEN_REPOSITORY)
    private readonly tokenRepository: EmailVerificationTokenRepository,

    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,

    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async execute(
    input: CreateEmailVerificationTokenInput,
  ): Promise<CreateEmailVerificationTokenOutput> {
    const token = randomUUID();

    const tokenHash = await this.tokenHasher.hash(token);

    const expiresAt = new Date(this.clock.now().getTime() + 30 * 60 * 1000);

    const verificationToken = EmailVerificationToken.create(
      {
        id: randomUUID(),
        userId: input.userId,
        tokenHash,
        expiresAt,
      },
      this.clock,
    );

    await this.tokenRepository.save(verificationToken);

    return {
      token,
    };
  }
}
