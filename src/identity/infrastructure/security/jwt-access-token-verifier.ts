import { JwtService } from '@nestjs/jwt';

import type { AccessTokenVerifier } from '../../domain/services/access-token-verifier';

export class JwtAccessTokenVerifier implements AccessTokenVerifier {
  private readonly jwtService: JwtService;

  constructor(secret: string) {
    this.jwtService = new JwtService({
      secret,
    });
  }

  async verify(token: string): Promise<{
    userId: string;
    tokenId: string;
    expiresAt: Date;
  }> {
    const payload = await this.jwtService.verifyAsync<{
      sub: string;
      jti: string;
      exp: number;
    }>(token);

    return {
      userId: payload.sub,
      tokenId: payload.jti,
      expiresAt: new Date(payload.exp * 1000),
    };
  }
}
