import { JwtService } from '@nestjs/jwt';

import type { AccessTokenVerifier } from '../../domain/services/access-token-verifier';

export class JwtAccessTokenVerifier implements AccessTokenVerifier {
  private readonly jwtService: JwtService;

  constructor(secret: string) {
    this.jwtService = new JwtService({
      secret,
    });
  }

  async verify(token: string): Promise<{ userId: string }> {
    const payload = await this.jwtService.verifyAsync<{
      sub: string;
    }>(token);

    return {
      userId: payload.sub,
    };
  }
}
