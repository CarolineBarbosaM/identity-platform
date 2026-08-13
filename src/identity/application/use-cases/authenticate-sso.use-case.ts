import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { ExternalIdentity } from '../../domain/entities/external-identity.entity';

import {
  EXTERNAL_IDENTITY_REPOSITORY,
} from '../../domain/repositories/external-identity.repository';

import type {
  ExternalIdentityRepository,
} from '../../domain/repositories/external-identity.repository';

import type {
  SsoProvider,
  SsoUserProfile,
} from '../../domain/services/sso-provider';

export interface AuthenticateSsoInput {
  provider: SsoProvider;
  code: string;
  state: string;
}

export interface AuthenticateSsoOutput {
  userId: string;
  provider: string;
  isNewIdentity: boolean;
}

export class AuthenticateSsoUseCase {
  constructor(
    @Inject(EXTERNAL_IDENTITY_REPOSITORY)
    private readonly externalIdentityRepository: ExternalIdentityRepository,
  ) {}

  async execute(
    input: AuthenticateSsoInput,
  ): Promise<AuthenticateSsoOutput> {
    const profile =
      await input.provider.authenticate(
        input.code,
        input.state,
      );

    const provider =
      input.provider.getName();

    const existingIdentity =
      await this.externalIdentityRepository
        .findByProviderAndProviderUserId(
          provider,
          profile.providerUserId,
        );

    if (existingIdentity) {
      return {
        userId: existingIdentity.getUserId(),
        provider,
        isNewIdentity: false,
      };
    }

    return this.createIdentity(
      provider,
      profile,
    );
  }

  private async createIdentity(
    provider: string,
    profile: SsoUserProfile,
  ): Promise<AuthenticateSsoOutput> {
    const userId = randomUUID();

    const externalIdentity =
      ExternalIdentity.create({
        id: randomUUID(),
        userId,
        provider,
        providerUserId:
          profile.providerUserId,
        email: profile.email,
      });

    await this.externalIdentityRepository.save(
      externalIdentity,
    );

    return {
      userId,
      provider,
      isNewIdentity: true,
    };
  }
}
