import type { TokenHasher } from '../../domain/services/token-hasher';

export class FakeTokenHasher implements TokenHasher {
  async hash(token: string): Promise<string> {
    return `hashed-${token}`;
  }

  async compare(token: string, hash: string): Promise<boolean> {
    return hash === `hashed-${token}`;
  }
}
