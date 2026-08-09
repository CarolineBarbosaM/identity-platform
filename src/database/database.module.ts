import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionOrmEntity } from '../identity/infrastructure/database/entities/session.orm-entity';
import { PasswordCredentialOrmEntity } from '../identity/infrastructure/database/entities/password-credential.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: Number(process.env.DATABASE_PORT ?? 5432),
      username: process.env.DATABASE_USER ?? 'postgres',
      password: process.env.DATABASE_PASSWORD ?? 'postgres',
      database: process.env.DATABASE_NAME ?? 'identity',
      autoLoadEntities: true,
      synchronize: false,
    }),

    TypeOrmModule.forFeature([PasswordCredentialOrmEntity, SessionOrmEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
