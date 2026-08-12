import {
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity('password_reset_tokens')
export class PasswordResetTokenOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column({ type: 'varchar', length: 255 })
  tokenHash!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'timestamp' })
  createdAt!: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  usedAt!: Date | null;
}
