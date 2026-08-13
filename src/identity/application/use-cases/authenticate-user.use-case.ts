import { Inject } from '@nestjs/common';

import {
  PASSWORD_CREDENTIAL_REPOSITORY,
} from '../../domain/repositories/password-credential.repository';

import type {
  PasswordCredentialRepository,
} from '../../domain/repositories/password-credential.repository';

import {
  PASSWORD_HASHER,
} from '../../domain/services/password-hasher';

import type {
  PasswordHasher,
} from '../../domain/services/password-hasher';

import {
  TWO_FACTOR_AUTHENTICATION_REPOSITORY,
} from '../../domain/repositories/two-factor-authentication.repository';

import type {
  TwoFactorAuthenticationRepository,
} from '../../domain/repositories/two-factor-authentication.repository';

export interface AuthenticateUserInput {
  userId: string;
  password: string;
}

export interface AuthenticateUserOutput {
  authenticated: boolean;
  requiresTwoFactor: boolean;
}

export class AuthenticateUser {
  constructor(
    @Inject(PASSWORD_CREDENTIAL_REPOSITORY)
    private readonly repository: PasswordCredentialRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(TWO_FACTOR_AUTHENTICATION_REPOSITORY)
    private readonly twoFactorRepository: TwoFactorAuthenticationRepository,
  ) {}

  async execute(
    input: AuthenticateUserInput,
  ): Promise<AuthenticateUserOutput> {
    const credential =
      await this.repository.findByUserId(
        input.userId,
      );

    if (!credential) {
      return {
        authenticated: false,
        requiresTwoFactor: false,
      };
    }

    const passwordValid =
      await this.passwordHasher.compare(
        input.password,
        credential.getPasswordHash(),
      );

    if (!passwordValid) {
      return {
        authenticated: false,
        requiresTwoFactor: false,
      };
    }

    const twoFactor =
      await this.twoFactorRepository.findByUserId(
        input.userId,
      );

    return {
      authenticated: true,
      requiresTwoFactor:
        twoFactor?.isEnabled() ?? false,
    };
  }
}