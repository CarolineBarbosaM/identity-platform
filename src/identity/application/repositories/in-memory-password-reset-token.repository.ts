import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';
import type { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';

export class InMemoryPasswordResetTokenRepository
  implements PasswordResetTokenRepository
{
  private readonly tokens: PasswordResetToken[] = [];

  async findByUserId(
    userId: string,
  ): Promise<PasswordResetToken | null> {
    return (
      this.tokens.find(
        (token) =>
          token.getUserId() === userId,
      ) ?? null
    );
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<PasswordResetToken | null> {
    return (
      this.tokens.find(
        (token) =>
          token.getTokenHash() === tokenHash,
      ) ?? null
    );
  }

  async save(
    token: PasswordResetToken,
  ): Promise<void> {
    const existingIndex =
      this.tokens.findIndex(
        (existingToken) =>
          existingToken.getId() ===
          token.getId(),
      );

    if (existingIndex === -1) {
      this.tokens.push(token);
      return;
    }

    this.tokens[existingIndex] = token;
  }
}
