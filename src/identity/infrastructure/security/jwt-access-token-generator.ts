import { JwtService } from '@nestjs/jwt';

import type { AccessTokenGenerator } from '../../domain/services/access-token-generator';

export class JwtAccessTokenGenerator implements AccessTokenGenerator {
  private readonly jwtService: JwtService;

  constructor(secret: string) {
    this.jwtService = new JwtService({
      secret,
    });
  }

  async generate(input: { userId: string }): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: input.userId,
      },
      {
        expiresIn: '15m',
      },
    );
  }
}
