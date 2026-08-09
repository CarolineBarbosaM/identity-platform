import { Inject, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { Session } from '../../domain/entities/session.entity';

import type { SessionRepository } from '../../domain/repositories/session.repository';
import type { RefreshTokenGenerator } from '../../domain/services/refresh-token-generator';
import type { TokenHasher } from '../../domain/services/token-hasher';
import type { AccessTokenGenerator } from '../../domain/services/access-token-generator';
import type { Clock } from '../../../shared/domain/clock';

import { SESSION_REPOSITORY } from '../../domain/repositories/session.repository';
import { REFRESH_TOKEN_GENERATOR } from '../../domain/services/refresh-token-generator';
import { TOKEN_HASHER } from '../../domain/services/token-hasher';
import { ACCESS_TOKEN_GENERATOR } from '../../domain/services/access-token-generator';
import { CLOCK } from '../../../shared/domain/clock';

export interface RefreshSessionInput {
  refreshToken: string;
}

export interface RefreshSessionOutput {
  accessToken: string;
  refreshToken: string;
}

export class RefreshSessionUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,

    @Inject(REFRESH_TOKEN_GENERATOR)
    private readonly refreshTokenGenerator: RefreshTokenGenerator,

    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,

    @Inject(ACCESS_TOKEN_GENERATOR)
    private readonly accessTokenGenerator: AccessTokenGenerator,

    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async execute(
    input: RefreshSessionInput,
  ): Promise<RefreshSessionOutput> {
    const separatorIndex = input.refreshToken.indexOf('.');

    if (separatorIndex <= 0) {
      throw new UnauthorizedException();
    }

    const sessionId = input.refreshToken.substring(
      0,
      separatorIndex,
    );

    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
      throw new UnauthorizedException();
    }

    if (session.getRevokedAt()) {
      throw new UnauthorizedException();
    }

    if (
      session.getExpiresAt().getTime() <=
      this.clock.now().getTime()
    ) {
      throw new UnauthorizedException();
    }

    const valid = await this.tokenHasher.compare(
      input.refreshToken,
      session.getRefreshTokenHash(),
    );

    if (!valid) {
      session.revoke(this.clock);

      await this.sessionRepository.save(session);

      throw new UnauthorizedException();
    }

    /*
     * Refresh Token Rotation:
     *
     * A sessão atual deixa de ser válida e uma nova sessão
     * passa a representar a continuidade da autenticação.
     */
    session.revoke(this.clock);

    await this.sessionRepository.save(session);

    const newSessionId = randomUUID();

    const newRefreshTokenSecret =
      await this.refreshTokenGenerator.generate();

    const newRefreshToken =
      `${newSessionId}.${newRefreshTokenSecret}`;

    const newRefreshTokenHash =
      await this.tokenHasher.hash(newRefreshToken);

    const newExpiresAt = new Date(
      this.clock.now().getTime() +
        30 * 24 * 60 * 60 * 1000,
    );

    const newSession = Session.create(
      {
        id: newSessionId,
        userId: session.getUserId(),
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: newExpiresAt,
      },
      this.clock,
    );

    await this.sessionRepository.save(newSession);

    const newAccessToken =
      await this.accessTokenGenerator.generate({
        userId: session.getUserId(),
      });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
