import {
  TwoFactorAuthenticator,
} from '../../domain/services/two-factor-authenticator';

import {
  TwoFactorAuthenticationRepository,
} from '../../domain/repositories/two-factor-authentication.repository';

export interface EnableTwoFactorAuthenticationInput {
  userId: string;
  code: string;
}

export class EnableTwoFactorAuthenticationUseCase {
  constructor(
    private readonly repository: TwoFactorAuthenticationRepository,
    private readonly authenticator: TwoFactorAuthenticator,
  ) {}

  async execute(
    input: EnableTwoFactorAuthenticationInput,
  ): Promise<void> {
    const twoFactor =
      await this.repository.findByUserId(
        input.userId,
      );

    if (!twoFactor) {
      throw new Error(
        'Two-factor authentication configuration not found',
      );
    }

    if (twoFactor.isEnabled()) {
      throw new Error(
        'Two-factor authentication is already enabled',
      );
    }

    const valid =
      await this.authenticator.verifyCode(
        twoFactor.getSecret(),
        input.code,
      );

    if (!valid) {
      throw new Error(
        'Invalid two-factor authentication code',
      );
    }

    twoFactor.enable();

    await this.repository.save(twoFactor);
  }
}
