import {
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity('two_factor_authentications')
export class TwoFactorAuthenticationOrmEntity {
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
  secret!: string;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @Column({
    name: 'enabled_at',
    type: 'timestamptz',
    nullable: true,
  })
  enabledAt!: Date | null;
}
