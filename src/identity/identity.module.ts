import { Module } from '@nestjs/common';
import { IdentityController } from './infrastructure/http/identity.controller';
import { AuthenticateUser } from './application/use-cases/authenticate-user.use-case';
import { Argon2PasswordHasher } from './infrastructure/security/argon2-password-hasher';
import { JwtAccessTokenVerifier } from './infrastructure/security/jwt-access-token-verifier';
import { PostgresPasswordCredentialRepository } from './infrastructure/database/repositories/postgres-password-credential.repository';
import { ACCESS_TOKEN_VERIFIER } from './domain/services/access-token-verifier';
import { PASSWORD_HASHER } from './domain/services/password-hasher';
import { PASSWORD_CREDENTIAL_REPOSITORY } from './domain/repositories/password-credential.repository';
import { CreatePasswordCredential } from './application/use-cases/create-password-credential.use-case';
import { CLOCK } from '../shared/domain/clock';
import { SystemClock } from '../shared/infrastructure/system-clock';
import { CreateSessionUseCase } from './application/use-cases/create-session.use-case';
import { Argon2TokenHasher } from './infrastructure/security/argon2-token-hasher';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.use-case';
import { LogoutSessionUseCase } from './application/use-cases/logout-session.use-case';
import { AuthGuard } from './infrastructure/http/auth.guard';
import { DatabaseModule } from '../database/database.module';
import { PostgresSessionRepository } from './infrastructure/database/repositories/postgres-session.repository';
import { FakeRefreshTokenGenerator } from './application/services/fake-refresh-token-generator';
import { JwtAccessTokenGenerator } from './infrastructure/security/jwt-access-token-generator';
import { RedisTokenBlacklist } from './infrastructure/security/redis-token-blacklist';

import { TOKEN_BLACKLIST } from './domain/services/token-blacklist';
import { SESSION_REPOSITORY } from './domain/repositories/session.repository';
import { TOKEN_HASHER } from './domain/services/token-hasher';
import { REFRESH_TOKEN_GENERATOR } from './domain/services/refresh-token-generator';
import { ACCESS_TOKEN_GENERATOR } from './domain/services/access-token-generator';

@Module({
  imports: [DatabaseModule],
  controllers: [IdentityController],
  providers: [
    AuthenticateUser,
    CreatePasswordCredential,
    CreateSessionUseCase,
    RefreshSessionUseCase,
    LogoutSessionUseCase,
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
      provide: SESSION_REPOSITORY, 
      useClass: PostgresSessionRepository, 
    },
    {
      provide: TOKEN_BLACKLIST,
      useClass: RedisTokenBlacklist,
    },
    {
      provide: ACCESS_TOKEN_GENERATOR,
      useFactory: () => new JwtAccessTokenGenerator('development-secret'),
    },
    {
      provide: ACCESS_TOKEN_VERIFIER,
      useFactory: () => new JwtAccessTokenVerifier('development-secret'),
    },
    {
      provide: CLOCK,
      useClass: SystemClock,
    },
  ],
})
export class IdentityModule {}
