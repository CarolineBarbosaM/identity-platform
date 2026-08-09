export const TOKEN_BLACKLIST = Symbol('TOKEN_BLACKLIST');

export interface TokenBlacklist {
  add(tokenId: string, expiresAt: Date): Promise<void>;
  has(tokenId: string): Promise<boolean>;
}
