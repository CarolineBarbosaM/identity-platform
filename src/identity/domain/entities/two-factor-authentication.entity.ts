import type { Clock } from '../../../shared/domain/clock';

export interface CreateTwoFactorAuthenticationProps {
  id: string;
  userId: string;
  secret: string;
}

export class TwoFactorAuthentication {
  private constructor(
    private readonly id: string,
    private readonly userId: string,
    private readonly secret: string,
    private readonly createdAt: Date,
    private readonly clock: Clock,
    private enabledAt: Date | null,
  ) {}

  static create(
    props: CreateTwoFactorAuthenticationProps,
    clock: Clock,
  ): TwoFactorAuthentication {
    const now = clock.now();

    return new TwoFactorAuthentication(
      props.id,
      props.userId,
      props.secret,
      now,
      clock,
      null,
    );
  }

  enable(): void {
    if (this.isEnabled()) {
      throw new Error(
        'Two-factor authentication is already enabled',
      );
    }

    this.enabledAt = this.clock.now();
  }

  isEnabled(): boolean {
    return this.enabledAt !== null;
  }

  getId(): string {
    return this.id;
  }

  getUserId(): string {
    return this.userId;
  }

  getSecret(): string {
    return this.secret;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getEnabledAt(): Date | null {
    return this.enabledAt;
  }
}
