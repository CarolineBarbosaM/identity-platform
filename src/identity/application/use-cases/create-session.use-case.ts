import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';

import {
  SESSION_REPOSITORY,
} from '../../domain/repositories/session.repository';

import type {
  SessionRepository,
} from '../../domain/repositories/session.repository';

import {
  REFRESH_TOKEN_GENERATOR,
} from '../../domain/services/refresh-token-generator';

import type {
  RefreshTokenGenerator,
} from '../../domain/services/refresh-token-generator';

import {
  CLOCK,
} from '../../../shared/domain/clock';

import type {
  Clock,
} from '../../../shared/domain/clock';

import {
  TOKEN_HASHER,
} from '../../domain/services/token-hasher';

import type {
  TokenHasher,
} from '../../domain/services/token-hasher';

import {
  ACCESS_TOKEN_GENERATOR,
} from '../../domain/services/access-token-generator';

import type {
  AccessTokenGenerator,
} from '../../domain/services/access-token-generator';

import { Session } from '../../domain/entities/session.entity';

export interface CreateSessionInput {
  userId: string;
}

export interface CreateSessionOutput {
  session: Session;
  accessToken: string;
  refreshToken: string;
}

export class CreateSessionUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,

    @Inject(REFRESH_TOKEN_GENERATOR)
    private readonly refreshTokenGenerator: RefreshTokenGenerator,

    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,

    @Inject(CLOCK)
    private readonly clock: Clock,

    @Inject(ACCESS_TOKEN_GENERATOR)
    private readonly accessTokenGenerator: AccessTokenGenerator,
  ) {}

  async execute(
    input: CreateSessionInput,
  ): Promise<CreateSessionOutput> {
    const sessionId = randomUUID();

    const refreshTokenSecret =
      await this.refreshTokenGenerator.generate();

    const refreshToken =
      `${sessionId}.${refreshTokenSecret}`;

    const accessToken =
      await this.accessTokenGenerator.generate({
        userId: input.userId,
      });

    const expiresAt = new Date(
      this.clock.now().getTime() +
        30 * 24 * 60 * 60 * 1000,
    );

    const refreshTokenHash =
      await this.tokenHasher.hash(refreshToken);

    const session = Session.create(
      {
        id: sessionId,
        userId: input.userId,
        refreshTokenHash,
        expiresAt,
      },
      this.clock,
    );

    await this.sessionRepository.save(session);

    return {
      session,
      accessToken,
      refreshToken,
    };
  }
}