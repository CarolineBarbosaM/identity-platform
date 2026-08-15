import { Inject } from '@nestjs/common';

import { USER_REPOSITORY } from '../../domain/repositories/user.repository';

import type { UserRepository } from '../../domain/repositories/user.repository';

import { EMAIL_VERIFICATION_TOKEN_REPOSITORY } from '../../domain/repositories/email-verification-token.repository';

import type { EmailVerificationTokenRepository } from '../../domain/repositories/email-verification-token.repository';

import { TOKEN_HASHER } from '../../domain/services/token-hasher';

import type { TokenHasher } from '../../domain/services/token-hasher';

export interface VerifyEmailInput {
  userId: string;
  token: string;
}

export class VerifyEmailUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(EMAIL_VERIFICATION_TOKEN_REPOSITORY)
    private readonly tokenRepository: EmailVerificationTokenRepository,

    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,
  ) {}

  async execute(input: VerifyEmailInput): Promise<void> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.getEmailVerifiedAt()) {
      throw new Error('User email is already verified');
    }

    const verificationToken = await this.tokenRepository.findByUserId(
      input.userId,
    );

    if (!verificationToken) {
      throw new Error('Email verification token not found');
    }

    if (verificationToken.isUsed()) {
      throw new Error('Email verification token has already been used');
    }

    if (verificationToken.isExpired()) {
      throw new Error('Email verification token has expired');
    }

    const isValid = await this.tokenHasher.compare(
      input.token,
      verificationToken.getTokenHash(),
    );

    if (!isValid) {
      throw new Error('Invalid email verification token');
    }

    user.verifyEmail();

    await this.userRepository.save(user);

    verificationToken.markAsUsed();

    await this.tokenRepository.save(verificationToken);
  }
}
