import { TwoFactorAuthentication } from '../entities/two-factor-authentication.entity';

export interface TwoFactorAuthenticationRepository {
  findByUserId(
    userId: string,
  ): Promise<TwoFactorAuthentication | null>;

  save(
    twoFactorAuthentication: TwoFactorAuthentication,
  ): Promise<void>;
}

export const TWO_FACTOR_AUTHENTICATION_REPOSITORY =
  Symbol('TWO_FACTOR_AUTHENTICATION_REPOSITORY');
  