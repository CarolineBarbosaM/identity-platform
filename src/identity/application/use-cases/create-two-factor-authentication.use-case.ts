import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { TwoFactorAuthentication } from '../../domain/entities/two-factor-authentication.entity';

import { TWO_FACTOR_AUTHENTICATION_REPOSITORY } from '../../domain/repositories/two-factor-authentication.repository';

import type { TwoFactorAuthenticationRepository } from '../../domain/repositories/two-factor-authentication.repository';

import type { TwoFactorAuthenticator } from '../../domain/services/two-factor-authenticator';

import { CLOCK } from '../../../shared/domain/clock';

import type { Clock } from '../../../shared/domain/clock';

export interface CreateTwoFactorAuthenticationInput {
  userId: string;
}

export interface CreateTwoFactorAuthenticationOutput {
  secret: string;
  enabled: boolean;
}

export class CreateTwoFactorAuthenticationUseCase {
  constructor(
    @Inject(TWO_FACTOR_AUTHENTICATION_REPOSITORY)
    private readonly repository: TwoFactorAuthenticationRepository,

    private readonly authenticator: TwoFactorAuthenticator,

    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async execute(
    input: CreateTwoFactorAuthenticationInput,
  ): Promise<CreateTwoFactorAuthenticationOutput> {
    const existing = await this.repository.findByUserId(input.userId);

    if (existing) {
      return {
        secret: existing.getSecret(),
        enabled: existing.isEnabled(),
      };
    }

    const secret = await this.authenticator.generateSecret();

    const twoFactor = TwoFactorAuthentication.create(
      {
        id: randomUUID(),
        userId: input.userId,
        secret,
      },
      this.clock,
    );

    await this.repository.save(twoFactor);

    return {
      secret: twoFactor.getSecret(),
      enabled: twoFactor.isEnabled(),
    };
  }
}
