import { Clock } from '../../../shared/domain/clock';

export interface CreatePasswordCredentialProps {
  id: string;
  userId: string;
  passwordHash: string;
}

export class PasswordCredential {
  private constructor(
    private readonly id: string,
    private readonly userId: string,
    private passwordHash: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private readonly clock: Clock,
  ) {}

  static create(
    props: CreatePasswordCredentialProps,
    clock: Clock,
  ): PasswordCredential {
    const now = clock.now();

    return new PasswordCredential(
      props.id,
      props.userId,
      props.passwordHash,
      now,
      now,
      clock,
    );
  }

  getId(): string {
    return this.id;
  }

  getUserId(): string {
    return this.userId;
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  changePassword(passwordHash: string): void {
    this.passwordHash = passwordHash;
    this.updatedAt = this.clock.now();
  }

  static rehydrate(
    props: {
      id: string;
      userId: string;
      passwordHash: string;
      createdAt: Date;
      updatedAt: Date;
    },
    clock: Clock,
  ): PasswordCredential {
    return new PasswordCredential(
      props.id,
      props.userId,
      props.passwordHash,
      props.createdAt,
      props.updatedAt,
      clock,
    );
  }
}
