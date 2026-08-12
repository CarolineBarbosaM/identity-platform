import { PasswordResetToken } from '../entities/password-reset-token.entity';

export interface PasswordResetTokenRepository {
  findByUserId(
    userId: string,
  ): Promise<PasswordResetToken | null>;

  findByTokenHash(
    tokenHash: string,
  ): Promise<PasswordResetToken | null>;

  save(token: PasswordResetToken): Promise<void>;
}

export const PASSWORD_RESET_TOKEN_REPOSITORY = Symbol(
  'PASSWORD_RESET_TOKEN_REPOSITORY',
);
