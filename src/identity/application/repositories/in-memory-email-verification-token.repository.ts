import { EmailVerificationToken } from '../../domain/entities/email-verification-token.entity';
import type { EmailVerificationTokenRepository } from '../../domain/repositories/email-verification-token.repository';

export class InMemoryEmailVerificationTokenRepository implements EmailVerificationTokenRepository {
  private readonly tokens = new Map<string, EmailVerificationToken>();

  async findById(id: string): Promise<EmailVerificationToken | null> {
    return this.tokens.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<EmailVerificationToken | null> {
    for (const token of this.tokens.values()) {
      if (token.getUserId() === userId) {
        return token;
      }
    }

    return null;
  }

  async save(token: EmailVerificationToken): Promise<void> {
    this.tokens.set(token.getId(), token);
  }
}
