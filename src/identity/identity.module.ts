import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IdentityController } from './infrastructure/http/identity.controller';

import { AuthenticateUser } from './application/use-cases/authenticate-user.use-case';
import { CreatePasswordCredential } from './application/use-cases/create-password-credential.use-case';
import { CreateSessionUseCase } from './application/use-cases/create-session.use-case';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.use-case';
import { LogoutSessionUseCase } from './application/use-cases/logout-session.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';

import { Argon2PasswordHasher } from './infrastructure/security/argon2-password-hasher';
import { JwtAccessTokenVerifier } from './infrastructure/security/jwt-access-token-verifier';
import { Argon2TokenHasher } from './infrastructure/security/argon2-token-hasher';
import { JwtAccessTokenGenerator } from './infrastructure/security/jwt-access-token-generator';

import { PostgresPasswordCredentialRepository } from './infrastructure/database/repositories/postgres-password-credential.repository';
import { PostgresSessionRepository } from './infrastructure/database/repositories/postgres-session.repository';
import { PostgresUserRepository } from './infrastructure/database/repositories/postgres-user.repository';
import { PostgresPasswordResetTokenRepository } from './infrastructure/database/repositories/postgres-password-reset-token.repository';

import { FakeRefreshTokenGenerator } from './application/services/fake-refresh-token-generator';

import { RedisTokenBlacklist } from './infrastructure/security/redis-token-blacklist';

import { UserOrmEntity } from './infrastructure/database/entities/user.orm-entity';
import { PasswordResetTokenOrmEntity } from './infrastructure/database/entities/password-reset-token.orm-entity';

import { AuthGuard } from './infrastructure/http/auth.guard';

import { DatabaseModule } from '../database/database.module';

import { CLOCK } from '../shared/domain/clock';
import { SystemClock } from '../shared/infrastructure/system-clock';

import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { PASSWORD_CREDENTIAL_REPOSITORY } from './domain/repositories/password-credential.repository';
import { PASSWORD_RESET_TOKEN_REPOSITORY } from './domain/repositories/password-reset-token.repository';
import { SESSION_REPOSITORY } from './domain/repositories/session.repository';

import { PASSWORD_HASHER } from './domain/services/password-hasher';
import { TOKEN_HASHER } from './domain/services/token-hasher';
import { REFRESH_TOKEN_GENERATOR } from './domain/services/refresh-token-generator';
import { ACCESS_TOKEN_GENERATOR } from './domain/services/access-token-generator';
import { ACCESS_TOKEN_VERIFIER } from './domain/services/access-token-verifier';
import { TOKEN_BLACKLIST } from './domain/services/token-blacklist';

@Module({
  imports: [
    DatabaseModule,

    TypeOrmModule.forFeature([
      UserOrmEntity,
      PasswordResetTokenOrmEntity,
    ]),
  ],

  controllers: [
    IdentityController,
  ],

  providers: [
    AuthenticateUser,
    CreatePasswordCredential,
    CreateSessionUseCase,
    RefreshSessionUseCase,
    LogoutSessionUseCase,
    ResetPasswordUseCase,
    AuthGuard,

    {
      provide: PASSWORD_HASHER,
      useClass: Argon2PasswordHasher,
    },

    {
      provide: TOKEN_HASHER,
      useClass: Argon2TokenHasher,
    },

    {
      provide: REFRESH_TOKEN_GENERATOR,
      useClass: FakeRefreshTokenGenerator,
    },

    {
      provide: PASSWORD_CREDENTIAL_REPOSITORY,
      useClass: PostgresPasswordCredentialRepository,
    },

    {
      provide: PASSWORD_RESET_TOKEN_REPOSITORY,
      useClass: PostgresPasswordResetTokenRepository,
    },

    {
      provide: SESSION_REPOSITORY,
      useClass: PostgresSessionRepository,
    },

    {
      provide: USER_REPOSITORY,
      useClass: PostgresUserRepository,
    },

    {
      provide: TOKEN_BLACKLIST,
      useClass: RedisTokenBlacklist,
    },

    {
      provide: ACCESS_TOKEN_GENERATOR,
      useFactory: () =>
        new JwtAccessTokenGenerator(
          'development-secret',
        ),
    },

    {
      provide: ACCESS_TOKEN_VERIFIER,
      useFactory: () =>
        new JwtAccessTokenVerifier(
          'development-secret',
        ),
    },

    {
      provide: CLOCK,
      useClass: SystemClock,
    },
  ],
})
export class IdentityModule {}
