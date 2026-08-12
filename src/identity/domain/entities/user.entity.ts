import { UserStatus } from '../enums/user-status.enum';
import { Clock } from '../../../shared/domain/clock';

export interface CreateUserProps {
  id: string;
  name: string;
  email: string;
}

export class User {
  private constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly email: string,
    private status: UserStatus,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private emailVerifiedAt: Date | null,
    private readonly clock: Clock,
  ) {}

  static create(props: CreateUserProps, clock: Clock): User {
    const now = clock.now();

    return new User(
      props.id,
      props.name,
      props.email,
      UserStatus.PENDING_EMAIL_VERIFICATION,
      now,
      now,
      null,
      clock,
    );
  }

  verifyEmail(): void {
    if (this.status !== UserStatus.PENDING_EMAIL_VERIFICATION) {
      throw new Error('User email cannot be verified in the current state');
    }

    const now = this.clock.now();

    this.status = UserStatus.ACTIVE;
    this.emailVerifiedAt = now;
    this.updatedAt = now;
  }

  suspend(): void {
    if (this.status === UserStatus.SUSPENDED) {
      return;
    }

    const now = this.clock.now();

    this.status = UserStatus.SUSPENDED;
    this.updatedAt = now;
  }

  reactivate(): void {
    if (this.status !== UserStatus.SUSPENDED) {
      throw new Error('User cannot be reactivated in the current state');
    }

    const now = this.clock.now();

    this.status = UserStatus.ACTIVE;
    this.updatedAt = now;
  }

  lock(): void {
    if (this.status === UserStatus.LOCKED) {
      return;
    }

    const now = this.clock.now();

    this.status = UserStatus.LOCKED;
    this.updatedAt = now;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  getStatus(): UserStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getEmailVerifiedAt(): Date | null {
    return this.emailVerifiedAt;
  }

  static rehydrate(
    props: {
      id: string;
      name: string;
      email: string;
      status: UserStatus;
      emailVerifiedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    },
    clock: Clock,
  ): User {
    return new User(
      props.id,
      props.name,
      props.email,
      props.status,
      props.createdAt,
      props.updatedAt,
      props.emailVerifiedAt,
      clock,
    );
  }
}
