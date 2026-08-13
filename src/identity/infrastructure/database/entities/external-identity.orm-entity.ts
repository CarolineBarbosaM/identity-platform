import {
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity('external_identities')
export class ExternalIdentityOrmEntity {
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
  provider!: string;

  @Column({
    name: 'provider_user_id',
    type: 'text',
  })
  providerUserId!: string;

  @Column({
    type: 'text',
  })
  email!: string;
}
