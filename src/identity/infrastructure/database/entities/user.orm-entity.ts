import { Column, Entity, PrimaryColumn } from 'typeorm';

import { UserStatus } from '../../../domain/enums/user-status.enum';

@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({
    type: 'text',
  })
  name!: string;

  @Column({
    type: 'text',
    unique: true,
  })
  email!: string;

  @Column({
    type: 'text',
  })
  status!: UserStatus;

  @Column({
    name: 'email_verified_at',
    type: 'timestamptz',
    nullable: true,
  })
  emailVerifiedAt!: Date | null;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
