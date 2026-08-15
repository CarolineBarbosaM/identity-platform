import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IdentityController } from './infrastructure/http/identity.controller';

import { AuthenticateUser } from './application/use-cases/authenticate-user.use-case';
import { AuthenticateSsoUseCase } from './application/use-cases/authenticate-sso.use-case';
import { CreatePasswordCredential } from './application/use-cases/create-password-credential.use-case';
import { CreateSessionUseCase } from './application/use-cases/create-session.use-case';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.use-case';
import { LogoutSessionUseCase } from './application/use-cases/logout-session.use-case';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { CreateEmailVerificationTokenUseCase } from './application/use-cases/create-email-verification-token.use-case';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { VerifyTwoFactorAuthenticationUseCase } from './application/use-cases/verify-two-factor-authentication.use-case';

import { RedisSsoStateStore } from './infrastructure/security/redis-sso-state-store';

import { PostgresTwoFactorAuthenticationRepository } from './infrastructure/database/repositories/postgres-two-factor-authentication.repository';
import { PostgresPasswordCredentialRepository } from './infrastructure/database/repositories/postgres-password-credential.repository';
import { PostgresSessionRepository } from './infrastructure/database/repositories/postgres-session.repository';
import { PostgresUserRepository } from './infrastructure/database/repositories/postgres-user.repository';
import { PostgresDeviceRepository } from './infrastructure/database/repositories/postgres-device.repository';
import { PostgresEmailVerificationTokenRepository } from './infrastructure/database/repositories/postgres-email-verification-token.repository';
import { PostgresPasswordResetTokenRepository } from './infrastructure/database/repositories/postgres-password-reset-token.repository';
import { PostgresExternalIdentityRepository } from './infrastructure/database/repositories/postgres-external-identity.repository';

import { TwoFactorAuthenticationOrmEntity } from './infrastructure/database/entities/two-factor-authentication.orm-entity';
import { UserOrmEntity } from './infrastructure/database/entities/user.orm-entity';
import { EmailVerificationTokenOrmEntity } from './infrastructure/database/entities/email-verification-token.orm-entity';
import { PasswordResetTokenOrmEntity } from './infrastructure/database/entities/password-reset-token.orm-entity';
import { ExternalIdentityOrmEntity } from './infrastructure/database/entities/external-identity.orm-entity';
import { PasswordCredentialOrmEntity } from './infrastructure/database/entities/password-credential.orm-entity';
import { SessionOrmEntity } from './infrastructure/database/entities/session.orm-entity';
import { DeviceOrmEntity } from './infrastructure/database/entities/device.orm-entity';

import { SsoProviderRegistry } from './application/services/sso-provider-registry';

import { GoogleSsoProvider } from './infrastructure/sso/google-sso.provider';
import { MicrosoftSsoProvider } from './infrastructure/sso/microsoft-sso.provider';

import { SSO_PROVIDERS } from './domain/services/sso-provider';
import { TWO_FACTOR_AUTHENTICATION_REPOSITORY } from './domain/repositories/two-factor-authentication.repository';

import { Argon2PasswordHasher } from './infrastructure/security/argon2-password-hasher';
import { Argon2TokenHasher } from './infrastructure/security/argon2-token-hasher';

import { JwtAccessTokenVerifier } from './infrastructure/security/jwt-access-token-verifier';
import { JwtAccessTokenGenerator } from './infrastructure/security/jwt-access-token-generator';

import { RedisTokenBlacklist } from './infrastructure/security/redis-token-blacklist';

import { FakeRefreshTokenGenerator } from './application/services/fake-refresh-token-generator';

import { AuthGuard } from './infrastructure/http/auth.guard';

import { DatabaseModule } from '../database/database.module';

import { CLOCK } from '../shared/domain/clock';
import { SystemClock } from '../shared/infrastructure/system-clock';

import { TWO_FACTOR_AUTHENTICATOR } from './domain/services/two-factor-authenticator';

import { OtplibTwoFactorAuthenticator } from './infrastructure/security/otplib-two-factor-authenticator';

import { SSO_STATE_STORE } from './domain/services/sso-state-store';

import { DEVICE_REPOSITORY } from './domain/repositories/device.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { PASSWORD_CREDENTIAL_REPOSITORY } from './domain/repositories/password-credential.repository';
import { PASSWORD_RESET_TOKEN_REPOSITORY } from './domain/repositories/password-reset-token.repository';
import { SESSION_REPOSITORY } from './domain/repositories/session.repository';
import { EMAIL_VERIFICATION_TOKEN_REPOSITORY } from './domain/repositories/email-verification-token.repository';
import { EXTERNAL_IDENTITY_REPOSITORY } from './domain/repositories/external-identity.repository';

import { PASSWORD_HASHER } from './domain/services/password-hasher';
import { TOKEN_HASHER } from './domain/services/token-hasher';
import { TOKEN_BLACKLIST } from './domain/services/token-blacklist';
import { REFRESH_TOKEN_GENERATOR } from './domain/services/refresh-token-generator';
import { ACCESS_TOKEN_GENERATOR } from './domain/services/access-token-generator';
import { ACCESS_TOKEN_VERIFIER } from './domain/services/access-token-verifier';

@Module({
  imports: [
    DatabaseModule,

    TypeOrmModule.forFeature([
      UserOrmEntity,
      EmailVerificationTokenOrmEntity,
      PasswordResetTokenOrmEntity,
      ExternalIdentityOrmEntity,
      TwoFactorAuthenticationOrmEntity,

      PasswordCredentialOrmEntity,
      SessionOrmEntity,
      DeviceOrmEntity,
    ]),
  ],

  controllers: [IdentityController],

  providers: [
    AuthenticateUser,
    AuthenticateSsoUseCase,

    CreatePasswordCredential,
    CreateSessionUseCase,
    RefreshSessionUseCase,
    LogoutSessionUseCase,

    CreateUserUseCase,
    CreateEmailVerificationTokenUseCase,
    VerifyEmailUseCase,
    ResetPasswordUseCase,
    VerifyTwoFactorAuthenticationUseCase,

    SsoProviderRegistry,

    GoogleSsoProvider,
    MicrosoftSsoProvider,

    {
      provide: SSO_PROVIDERS,
      useFactory: (
        googleSsoProvider: GoogleSsoProvider,
        microsoftSsoProvider: MicrosoftSsoProvider,
      ) => [googleSsoProvider, microsoftSsoProvider],
      inject: [GoogleSsoProvider, MicrosoftSsoProvider],
    },

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
      provide: SSO_STATE_STORE,
      useClass: RedisSsoStateStore,
    },

    {
      provide: TWO_FACTOR_AUTHENTICATION_REPOSITORY,
      useClass: PostgresTwoFactorAuthenticationRepository,
    },

    {
      provide: TWO_FACTOR_AUTHENTICATOR,
      useClass: OtplibTwoFactorAuthenticator,
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
      provide: DEVICE_REPOSITORY,
      useClass: PostgresDeviceRepository,
    },

    {
      provide: EMAIL_VERIFICATION_TOKEN_REPOSITORY,
      useClass: PostgresEmailVerificationTokenRepository,
    },

    {
      provide: EXTERNAL_IDENTITY_REPOSITORY,
      useClass: PostgresExternalIdentityRepository,
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
