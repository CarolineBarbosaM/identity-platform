import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('password_credentials')
export class PasswordCredentialOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId!: string;

  @Column({
    name: 'password_hash',
    type: 'text',
  })
  passwordHash!: string;

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
