import { Clock } from '../../../shared/domain/clock';

export interface CreatePasswordResetTokenProps {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export class PasswordResetToken {
  private constructor(
    private readonly id: string,
    private readonly userId: string,
    private readonly tokenHash: string,
    private readonly expiresAt: Date,
    private readonly createdAt: Date,
    private usedAt: Date | null,
    private readonly clock: Clock,
  ) {}

  static create(
    props: CreatePasswordResetTokenProps,
    clock: Clock,
  ): PasswordResetToken {
    const now = clock.now();

    return new PasswordResetToken(
      props.id,
      props.userId,
      props.tokenHash,
      props.expiresAt,
      now,
      null,
      clock,
    );
  }

  isExpired(): boolean {
    return this.clock.now().getTime() >= this.expiresAt.getTime();
  }

  isUsed(): boolean {
    return this.usedAt !== null;
  }

  consume(): void {
    if (this.isUsed()) {
      throw new Error('Password reset token has already been used');
    }

    if (this.isExpired()) {
      throw new Error('Password reset token has expired');
    }

    this.usedAt = this.clock.now();
  }

  getId(): string {
    return this.id;
  }

  getUserId(): string {
    return this.userId;
  }

  getTokenHash(): string {
    return this.tokenHash;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUsedAt(): Date | null {
    return this.usedAt;
  }

  static rehydrate(
    props: {
      id: string;
      userId: string;
      tokenHash: string;
      expiresAt: Date;
      createdAt: Date;
      usedAt: Date | null;
    },
    clock: Clock,
  ): PasswordResetToken {
    return new PasswordResetToken(
      props.id,
      props.userId,
      props.tokenHash,
      props.expiresAt,
      props.createdAt,
      props.usedAt,
      clock,
    );
  }
}
