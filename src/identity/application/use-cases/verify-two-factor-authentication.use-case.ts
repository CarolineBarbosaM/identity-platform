import { Inject } from '@nestjs/common';

import { TWO_FACTOR_AUTHENTICATION_REPOSITORY } from '../../domain/repositories/two-factor-authentication.repository';

import type { TwoFactorAuthenticationRepository } from '../../domain/repositories/two-factor-authentication.repository';

import {
  TWO_FACTOR_AUTHENTICATOR,
} from '../../domain/services/two-factor-authenticator';

import type { TwoFactorAuthenticator } from '../../domain/services/two-factor-authenticator';

export interface VerifyTwoFactorAuthenticationInput {
  userId: string;
  code: string;
}

export class VerifyTwoFactorAuthenticationUseCase {
  constructor(
    @Inject(TWO_FACTOR_AUTHENTICATION_REPOSITORY)
    private readonly repository: TwoFactorAuthenticationRepository,

    @Inject(TWO_FACTOR_AUTHENTICATOR)
    private readonly authenticator: TwoFactorAuthenticator,
  ) {}

  async execute(input: VerifyTwoFactorAuthenticationInput): Promise<boolean> {
    const twoFactor = await this.repository.findByUserId(input.userId);

    if (!twoFactor) {
      return false;
    }

    if (!twoFactor.isEnabled()) {
      return false;
    }

    return this.authenticator.verifyCode(
      twoFactor.getSecret(),
      input.code,
    );
  }
}
