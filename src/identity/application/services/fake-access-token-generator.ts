import type { AccessTokenGenerator } from '../../domain/services/access-token-generator';

export class FakeAccessTokenGenerator implements AccessTokenGenerator {
  async generate(input: { userId: string }): Promise<string> {
    return `access-token-${input.userId}`;
  }
}
