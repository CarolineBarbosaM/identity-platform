import { Clock } from '../../../shared/domain/clock';

export interface CreateEmailVerificationTokenProps {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export class EmailVerificationToken {
  private constructor(
    private readonly id: string,
    private readonly userId: string,
    private readonly tokenHash: string,
    private readonly expiresAt: Date,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private usedAt: Date | null,
    private readonly clock: Clock,
  ) {}

  static create(
    props: CreateEmailVerificationTokenProps,
    clock: Clock,
  ): EmailVerificationToken {
    const now = clock.now();

    return new EmailVerificationToken(
      props.id,
      props.userId,
      props.tokenHash,
      props.expiresAt,
      now,
      now,
      null,
      clock,
    );
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

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getUsedAt(): Date | null {
    return this.usedAt;
  }

  isUsed(): boolean {
    return this.usedAt !== null;
  }

  isExpired(): boolean {
    return this.clock.now().getTime() >= this.expiresAt.getTime();
  }

  markAsUsed(): void {
    if (this.usedAt) {
      return;
    }

    const now = this.clock.now();

    this.usedAt = now;
    this.updatedAt = now;
  }

  static rehydrate(
    props: {
      id: string;
      userId: string;
      tokenHash: string;
      expiresAt: Date;
      createdAt: Date;
      updatedAt: Date;
      usedAt: Date | null;
    },
    clock: Clock,
  ): EmailVerificationToken {
    return new EmailVerificationToken(
      props.id,
      props.userId,
      props.tokenHash,
      props.expiresAt,
      props.createdAt,
      props.updatedAt,
      props.usedAt,
      clock,
    );
  }
}
