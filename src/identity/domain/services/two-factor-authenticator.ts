export interface TwoFactorAuthenticator {
  generateSecret(): Promise<string>;

  verifyCode(secret: string, code: string): Promise<boolean>;
}
