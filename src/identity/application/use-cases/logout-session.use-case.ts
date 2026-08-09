import { Inject, UnauthorizedException } from '@nestjs/common';

import { SESSION_REPOSITORY } from '../../domain/repositories/session.repository';
import type { SessionRepository } from '../../domain/repositories/session.repository';

import { TOKEN_BLACKLIST } from '../../domain/services/token-blacklist';
import type { TokenBlacklist } from '../../domain/services/token-blacklist';

import { CLOCK } from '../../../shared/domain/clock';
import type { Clock } from '../../../shared/domain/clock';

export interface LogoutSessionInput {
  sessionId: string;
  userId: string;
  tokenId: string;
  expiresAt: Date;
}

export class LogoutSessionUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,

    @Inject(TOKEN_BLACKLIST)
    private readonly tokenBlacklist: TokenBlacklist,

    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async execute(input: LogoutSessionInput): Promise<void> {
    const session = await this.sessionRepository.findById(input.sessionId);

    if (!session) {
      throw new UnauthorizedException();
    }

    if (session.getUserId() !== input.userId) {
      throw new UnauthorizedException();
    }

    if (session.getRevokedAt()) {
      return;
    }

    session.revoke(this.clock);

    await this.sessionRepository.save(session);

    await this.tokenBlacklist.add(input.tokenId, input.expiresAt);
  }
}
