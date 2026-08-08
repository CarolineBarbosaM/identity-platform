import type {
  RefreshTokenGenerator,
} from '../../domain/services/refresh-token-generator';

export class FakeRefreshTokenGenerator
  implements RefreshTokenGenerator
{
  async generate(): Promise<string> {
    return 'refresh-token';
  }
}