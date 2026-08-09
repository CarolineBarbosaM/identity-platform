import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ACCESS_TOKEN_VERIFIER } from '../../domain/services/access-token-verifier';
import type { AccessTokenVerifier } from '../../domain/services/access-token-verifier';

import { TOKEN_BLACKLIST } from '../../domain/services/token-blacklist';
import type { TokenBlacklist } from '../../domain/services/token-blacklist';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(ACCESS_TOKEN_VERIFIER)
    private readonly accessTokenVerifier: AccessTokenVerifier,

    @Inject(TOKEN_BLACKLIST)
    private readonly tokenBlacklist: TokenBlacklist,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException();
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.accessTokenVerifier.verify(token);

      const revoked = await this.tokenBlacklist.has(payload.tokenId);

      if (revoked) {
        throw new UnauthorizedException();
      }

      request.user = {
        userId: payload.userId,
        tokenId: payload.tokenId,
        expiresAt: payload.expiresAt,
      };

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
