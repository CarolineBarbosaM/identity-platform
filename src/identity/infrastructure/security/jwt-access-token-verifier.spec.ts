import { JwtAccessTokenVerifier } from './jwt-access-token-verifier';
import { JwtAccessTokenGenerator } from './jwt-access-token-generator';

describe('JwtAccessTokenVerifier', () => {
  it('should verify a valid access token', async () => {
    const secret = 'test-secret';

    const generator = new JwtAccessTokenGenerator(secret);

    const verifier = new JwtAccessTokenVerifier(secret);

    const token = await generator.generate({
      userId: 'user-id',
    });

    const result = await verifier.verify(token);

    expect(result.userId).toBe('user-id');
    expect(result.tokenId).toEqual(expect.any(String));
    expect(result.expiresAt).toEqual(expect.any(Date));
  });

  it('should reject an invalid access token', async () => {
    const verifier = new JwtAccessTokenVerifier('test-secret');

    await expect(verifier.verify('invalid-token')).rejects.toThrow();
  });
});
