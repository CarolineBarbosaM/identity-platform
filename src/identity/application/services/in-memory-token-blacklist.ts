import { TokenBlacklist } from '../../domain/services/token-blacklist';

export class InMemoryTokenBlacklist implements TokenBlacklist {
  private readonly revokedTokens = new Map<string, Date>();

  async add(tokenId: string, expiresAt: Date): Promise<void> {
    this.revokedTokens.set(tokenId, expiresAt);
  }

  async has(tokenId: string): Promise<boolean> {
    const expiresAt = this.revokedTokens.get(tokenId);

    if (!expiresAt) {
      return false;
    }

    if (expiresAt.getTime() <= Date.now()) {
      this.revokedTokens.delete(tokenId);
      return false;
    }

    return true;
  }
}
