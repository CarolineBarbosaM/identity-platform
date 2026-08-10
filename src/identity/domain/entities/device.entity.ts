import { Clock } from '../../../shared/domain/clock';

export interface CreateDeviceProps {
  id: string;
  userId: string;
  name: string;
  userAgent: string;
  ipAddress: string;
}

export interface RehydrateDeviceProps {
  id: string;
  userId: string;
  name: string;
  userAgent: string;
  ipAddress: string;
  createdAt: Date;
  lastSeenAt: Date;
  revokedAt: Date | null;
}

export class Device {
  private constructor(
    private readonly id: string,
    private readonly userId: string,
    private readonly name: string,
    private readonly userAgent: string,
    private readonly ipAddress: string,
    private readonly createdAt: Date,
    private lastSeenAt: Date,
    private revokedAt: Date | null,
    private readonly clock: Clock,
  ) {}

  static create(props: CreateDeviceProps, clock: Clock): Device {
    const now = clock.now();

    return new Device(
      props.id,
      props.userId,
      props.name,
      props.userAgent,
      props.ipAddress,
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

  getName(): string {
    return this.name;
  }

  getUserAgent(): string {
    return this.userAgent;
  }

  getIpAddress(): string {
    return this.ipAddress;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getLastSeenAt(): Date {
    return this.lastSeenAt;
  }

  getRevokedAt(): Date | null {
    return this.revokedAt;
  }

  updateLastSeen(): void {
    this.lastSeenAt = this.clock.now();
  }

  revoke(): void {
    if (this.revokedAt) {
      return;
    }

    this.revokedAt = this.clock.now();
  }

  static rehydrate(
  props: RehydrateDeviceProps,
  clock: Clock,
): Device {
  return new Device(
    props.id,
    props.userId,
    props.name,
    props.userAgent,
    props.ipAddress,
    props.createdAt,
    props.lastSeenAt,
    props.revokedAt,
    clock,
  );
}
}
