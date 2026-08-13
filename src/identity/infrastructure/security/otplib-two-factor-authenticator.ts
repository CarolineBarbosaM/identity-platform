import {
  OTP,
} from 'otplib';

import {
  crypto,
} from '@otplib/plugin-crypto-node';

import {
  base32,
} from '@otplib/plugin-base32-scure';

import type {
  TwoFactorAuthenticator,
} from '../../domain/services/two-factor-authenticator';

export class OtplibTwoFactorAuthenticator
  implements TwoFactorAuthenticator
{
  private readonly otp: OTP;

  constructor() {
    this.otp = new OTP({
      strategy: 'totp',
      crypto,
      base32,
    });
  }

  async generateSecret(): Promise<string> {
    return this.otp.generateSecret();
  }

  async verifyCode(
    secret: string,
    code: string,
  ): Promise<boolean> {
    const result =
      await this.otp.verify({
        secret,
        token: code,
      });

    return result.valid;
  }
}
