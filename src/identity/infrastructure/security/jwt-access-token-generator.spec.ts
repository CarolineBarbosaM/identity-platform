import { JwtService } from '@nestjs/jwt';
import { JwtAccessTokenGenerator } from './jwt-access-token-generator';

describe('JwtAccessTokenGenerator', () => {
  it('should generate an access token with user identity', async () => {
    const generator = new JwtAccessTokenGenerator(
      'test-secret',
    );

    const token = await generator.generate({
      userId: 'user-id',
    });

    const jwtService = new JwtService({
      secret: 'test-secret',
    });

    const payload = await jwtService.verifyAsync(token);

    expect(payload.sub).toBe('user-id');
    expect(payload.exp - payload.iat).toBe(15 * 60);
  });
});
