import {
  TwoFactorAuthentication,
} from '../../domain/entities/two-factor-authentication.entity';

import {
  TwoFactorAuthenticationRepository,
} from '../../domain/repositories/two-factor-authentication.repository';

export class InMemoryTwoFactorAuthenticationRepository
  implements TwoFactorAuthenticationRepository
{
  private readonly items: TwoFactorAuthentication[] = [];

  async findByUserId(
    userId: string,
  ): Promise<TwoFactorAuthentication | null> {
    return (
      this.items.find(
        (item) =>
          item.getUserId() === userId,
      ) ?? null
    );
  }

  async save(
    twoFactorAuthentication: TwoFactorAuthentication,
  ): Promise<void> {
    const index = this.items.findIndex(
      (item) =>
        item.getId() ===
        twoFactorAuthentication.getId(),
    );

    if (index >= 0) {
      this.items[index] =
        twoFactorAuthentication;

      return;
    }

    this.items.push(
      twoFactorAuthentication,
    );
  }
}
