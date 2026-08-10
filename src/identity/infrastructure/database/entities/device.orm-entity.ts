import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('devices')
export class DeviceOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId!: string;

  @Column({
    type: 'text',
  })
  name!: string;

  @Column({
    name: 'user_agent',
    type: 'text',
  })
  userAgent!: string;

  @Column({
    name: 'ip_address',
    type: 'text',
  })
  ipAddress!: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @Column({
    name: 'last_seen_at',
    type: 'timestamptz',
  })
  lastSeenAt!: Date;

  @Column({
    name: 'revoked_at',
    type: 'timestamptz',
    nullable: true,
  })
  revokedAt!: Date | null;
}
