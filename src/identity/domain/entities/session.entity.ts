import { Clock } from '../../../shared/domain/clock';

export interface CreateSessionProps {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

export interface RehydrateSessionProps {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Session {
  private constructor(
    private readonly id: string,
    private readonly userId: string,
    private refreshTokenHash: string,
    private readonly expiresAt: Date,
    private revokedAt: Date | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(props: CreateSessionProps, clock: Clock): Session {
    const now = clock.now();

    return new Session(
      props.id,
      props.userId,
      props.refreshTokenHash,
      props.expiresAt,
      null,
      now,
      now,
    );
  }

  getId(): string {
    return this.id;
  }

  getUserId(): string {
    return this.userId;
  }

  getRefreshTokenHash(): string {
    return this.refreshTokenHash;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  getRevokedAt(): Date | null {
    return this.revokedAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  revoke(clock: Clock): void {
    const now = clock.now();

    this.revokedAt = now;
    this.updatedAt = now;
  }

  static rehydrate(
    props: RehydrateSessionProps,
    clock: Clock,
  ): Session {
    return new Session(
      props.id,
      props.userId,
      props.refreshTokenHash,
      props.expiresAt,
      props.revokedAt,
      props.createdAt,
      props.updatedAt,
    );
  }
}
