import { EmailVerificationToken } from '../entities/email-verification-token.entity';

export interface EmailVerificationTokenRepository {
  findById(id: string): Promise<EmailVerificationToken | null>;

  findByUserId(userId: string): Promise<EmailVerificationToken | null>;

  save(token: EmailVerificationToken): Promise<void>;
}

export const EMAIL_VERIFICATION_TOKEN_REPOSITORY = Symbol(
  'EMAIL_VERIFICATION_TOKEN_REPOSITORY',
);
