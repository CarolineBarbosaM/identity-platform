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

@Module({
  controllers: [IdentityController],
  providers: [
    AuthenticateUser,
    CreatePasswordCredential,
    {
      provide: PASSWORD_HASHER,
      useClass: Argon2PasswordHasher,
    },
    {
      provide: PASSWORD_CREDENTIAL_REPOSITORY,
      useClass: InMemoryPasswordCredentialRepository,
    },
    {
      provide: CLOCK,
      useClass: SystemClock,
    },
  ],
})
export class IdentityModule {}