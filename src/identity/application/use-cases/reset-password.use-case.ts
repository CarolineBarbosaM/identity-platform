import { Inject } from '@nestjs/common';

import { PASSWORD_CREDENTIAL_REPOSITORY } from '../../domain/repositories/password-credential.repository';

import type { PasswordCredentialRepository } from '../../domain/repositories/password-credential.repository';

import { PASSWORD_RESET_TOKEN_REPOSITORY } from '../../domain/repositories/password-reset-token.repository';

import type { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';

import { PASSWORD_HASHER } from '../../domain/services/password-hasher';

import type { PasswordHasher } from '../../domain/services/password-hasher';

import { TOKEN_HASHER } from '../../domain/services/token-hasher';

import type { TokenHasher } from '../../domain/services/token-hasher';

export interface ResetPasswordInput {
  userId: string;
  token: string;
  newPassword: string;
}

export class ResetPasswordUseCase {
  constructor(
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,

    @Inject(PASSWORD_CREDENTIAL_REPOSITORY)
    private readonly passwordCredentialRepository: PasswordCredentialRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    const resetToken = await this.passwordResetTokenRepository.findByUserId(
      input.userId,
    );

    if (!resetToken) {
      throw new Error('Invalid password reset token');
    }

    const tokenMatches = await this.tokenHasher.compare(
      input.token,
      resetToken.getTokenHash(),
    );

    if (!tokenMatches) {
      throw new Error('Invalid password reset token');
    }

    if (resetToken.isUsed()) {
      throw new Error('Password reset token has already been used');
    }

    if (resetToken.isExpired()) {
      throw new Error('Password reset token has expired');
    }

    const credential = await this.passwordCredentialRepository.findByUserId(
      input.userId,
    );

    if (!credential) {
      throw new Error('Password credential not found');
    }

    const passwordHash = await this.passwordHasher.hash(input.newPassword);

    credential.changePassword(passwordHash);

    resetToken.consume();

    await this.passwordCredentialRepository.save(credential);

    await this.passwordResetTokenRepository.save(resetToken);
  }
}
