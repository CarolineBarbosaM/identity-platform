import 'dotenv/config';
import { DataSource } from 'typeorm';

import { PasswordCredentialOrmEntity } from '../identity/infrastructure/database/entities/password-credential.orm-entity';
import { SessionOrmEntity } from '../identity/infrastructure/database/entities/session.orm-entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5433),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'identity',
  entities: [
    PasswordCredentialOrmEntity,
    SessionOrmEntity,
  ],
  migrations: ['src/database/migrations/*.ts'],
});
