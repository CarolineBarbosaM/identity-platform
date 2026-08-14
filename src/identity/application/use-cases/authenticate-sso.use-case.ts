import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { ExternalIdentity } from '../../domain/entities/external-identity.entity';

import {
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository';

import type {
  UserRepository,
} from '../../domain/repositories/user.repository';

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

    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
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

    const existingUser =
      await this.userRepository.findByEmail(
        profile.email,
      );

    if (existingUser) {
      return this.createIdentity(
        provider,
        profile,
        existingUser.getId(),
      );
    }

    return this.createIdentity(
      provider,
      profile,
    );
  }

  private async createIdentity(
    provider: string,
    profile: SsoUserProfile,
    userId?: string,
  ): Promise<AuthenticateSsoOutput> {
    const identityUserId =
      userId ?? randomUUID();

    const externalIdentity =
      ExternalIdentity.create({
        id: randomUUID(),
        userId: identityUserId,
        provider,
        providerUserId:
          profile.providerUserId,
        email: profile.email,
      });

    await this.externalIdentityRepository.save(
      externalIdentity,
    );

    return {
      userId: identityUserId,
      provider,
      isNewIdentity: true,
    };
  }
}
