import { Inject } from '@nestjs/common';
import { PASSWORD_CREDENTIAL_REPOSITORY } from '../../domain/repositories/password-credential.repository';
import type { PasswordCredentialRepository } from '../../domain/repositories/password-credential.repository';
import { PASSWORD_HASHER } from '../../domain/services/password-hasher';
import type { PasswordHasher } from '../../domain/services/password-hasher';

export interface AuthenticateUserInput {
  userId: string;
  password: string;
}

export class AuthenticateUser {
  constructor(
    @Inject(PASSWORD_CREDENTIAL_REPOSITORY)
    private readonly repository: PasswordCredentialRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: AuthenticateUserInput): Promise<boolean> {
    const credential = await this.repository.findByUserId(input.userId);

    if (!credential) {
      return false;
    }

    return this.passwordHasher.compare(
      input.password,
      credential.getPasswordHash(),
    );
  }
}
