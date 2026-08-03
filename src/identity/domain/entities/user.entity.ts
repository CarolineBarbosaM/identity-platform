import { UserStatus } from '../enums/user-status.enum';

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
  ) {}

  static create(props: CreateUserProps): User {
    const now = new Date();

    return new User(
      props.id,
      props.name,
      props.email,
      UserStatus.PENDING_EMAIL_VERIFICATION,
      now,
      now,
      null,
    );
  }

  verifyEmail(): void {
    if (this.status !== UserStatus.PENDING_EMAIL_VERIFICATION) {
      throw new Error('User email cannot be verified in the current state');
    }

    this.status = UserStatus.ACTIVE;
    this.emailVerifiedAt = new Date();
    this.updatedAt = new Date();
  }

  suspend(): void {
    if (this.status === UserStatus.SUSPENDED) {
      return;
    }

    this.status = UserStatus.SUSPENDED;
    this.updatedAt = new Date();
  }

  lock(): void {
    if (this.status === UserStatus.LOCKED) {
      return;
    }

    this.status = UserStatus.LOCKED;
    this.updatedAt = new Date();
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
}