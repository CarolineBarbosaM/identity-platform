import { Module } from '@nestjs/common';
import { IdentityController } from './infrastructure/http/identity.controller';
import { AuthenticateUser } from './application/use-cases/authenticate-user.use-case';
import { Argon2PasswordHasher } from './infrastructure/security/argon2-password-hasher';
import { InMemoryPasswordCredentialRepository } from './application/repositories/in-memory-password-credential.repository';
import {
  PASSWORD_HASHER,
} from './domain/services/password-hasher';
import {
  PASSWORD_CREDENTIAL_REPOSITORY,
} from './domain/repositories/password-credential.repository';
import { CreatePasswordCredential } from './application/use-cases/create-password-credential.use-case';
import { CLOCK } from '../shared/domain/clock';
import { SystemClock } from '../shared/infrastructure/system-clock';
import { CreateSessionUseCase } from './application/use-cases/create-session.use-case';
import { InMemorySessionRepository } from './application/repositories/in-memory-session.repository';
import { Argon2TokenHasher } from './infrastructure/security/argon2-token-hasher';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.use-case';

import {
  SESSION_REPOSITORY,
} from './domain/repositories/session.repository';

import {
  TOKEN_HASHER,
} from './domain/services/token-hasher';
import { FakeRefreshTokenGenerator } from './application/services/fake-refresh-token-generator';
import {
  REFRESH_TOKEN_GENERATOR,
} from './domain/services/refresh-token-generator';
import { JwtAccessTokenGenerator } from './infrastructure/security/jwt-access-token-generator';
import {
  ACCESS_TOKEN_GENERATOR,
} from './domain/services/access-token-generator';

@Module({
  controllers: [IdentityController],
  providers: [
    AuthenticateUser,
    CreatePasswordCredential,
    CreateSessionUseCase,
    RefreshSessionUseCase,
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
      useClass: InMemoryPasswordCredentialRepository,
    },
    {
      provide: SESSION_REPOSITORY,
      useClass: InMemorySessionRepository,
    },
    {
      provide: ACCESS_TOKEN_GENERATOR,
      useFactory: () =>
        new JwtAccessTokenGenerator(
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