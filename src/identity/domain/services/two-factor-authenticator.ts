export interface TwoFactorAuthenticator {
  generateSecret(): Promise<string>;

  verifyCode(secret: string, code: string): Promise<boolean>;
}

export const TWO_FACTOR_AUTHENTICATOR = Symbol('TWO_FACTOR_AUTHENTICATOR');