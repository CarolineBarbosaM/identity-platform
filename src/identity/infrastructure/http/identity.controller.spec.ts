import { UnauthorizedException } from '@nestjs/common';

import { IdentityController } from './identity.controller';

import { AuthenticateUser } from '../../application/use-cases/authenticate-user.use-case';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { CreateSessionUseCase } from '../../application/use-cases/create-session.use-case';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case';
import { LogoutSessionUseCase } from '../../application/use-cases/logout-session.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { VerifyEmailUseCase } from '../../application/use-cases/verify-email.use-case';
import { VerifyTwoFactorAuthenticationUseCase } from '../../application/use-cases/verify-two-factor-authentication.use-case';

import { SsoProviderRegistry } from '../../application/services/sso-provider-registry';
import { AuthenticateSsoUseCase } from '../../application/use-cases/authenticate-sso.use-case';

import type { SsoProvider } from '../../domain/services/sso-provider';
import type { SsoStateStore } from '../../domain/services/sso-state-store';

import { User } from '../../domain/entities/user.entity';
import { UserStatus } from '../../domain/enums/user-status.enum';

describe('IdentityController', () => {
  const createSsoStateStore = () =>
    ({
      save: jest.fn(),
      consume: jest.fn(),
    }) as unknown as SsoStateStore;

  it('should register a user', async () => {
    const user = User.create(
      {
        id: 'user-id',
        name: 'Caroline',
        email: 'caroline@example.com',
      },
      {
        now: () => new Date('2026-08-12T10:00:00.000Z'),
      },
    );

    const createUser = {
      execute: jest.fn().mockResolvedValue({
        user,
      }),
    } as unknown as CreateUserUseCase;

    const authenticateUser = {
      execute: jest.fn(),
    } as unknown as AuthenticateUser;

    const createSession = {
      execute: jest.fn(),
    } as unknown as CreateSessionUseCase;

    const refreshSession = {
      execute: jest.fn(),
    } as unknown as RefreshSessionUseCase;

    const logoutSession = {
      execute: jest.fn(),
    } as unknown as LogoutSessionUseCase;

    const resetPassword = {
      execute: jest.fn(),
    } as unknown as ResetPasswordUseCase;

    const verifyEmail = {
      execute: jest.fn(),
    } as unknown as VerifyEmailUseCase;

    const verifyTwoFactorAuthentication = {
      execute: jest.fn(),
    } as unknown as VerifyTwoFactorAuthenticationUseCase;

    const ssoProviderRegistry = {
      get: jest.fn(),
    } as unknown as SsoProviderRegistry;

    const authenticateSso = {
      execute: jest.fn(),
    } as unknown as AuthenticateSsoUseCase;

    const ssoStateStore = createSsoStateStore();

    const controller = new IdentityController(
      createUser,
      authenticateUser,
      createSession,
      refreshSession,
      logoutSession,
      resetPassword,
      verifyEmail,
      verifyTwoFactorAuthentication,
      ssoProviderRegistry,
      authenticateSso,
      ssoStateStore,
    );

    const result = await controller.register({
      name: 'Caroline',
      email: 'caroline@example.com',
      password: 'plain-password',
    });

    expect(createUser.execute).toHaveBeenCalledWith({
      name: 'Caroline',
      email: 'caroline@example.com',
      password: 'plain-password',
    });

    expect(result).toEqual({
      id: 'user-id',
      name: 'Caroline',
      email: 'caroline@example.com',
      status: UserStatus.PENDING_EMAIL_VERIFICATION,
    });
  });

  it('should authenticate a user without two-factor authentication', async () => {
    const authenticateUser = {
      execute: jest.fn().mockResolvedValue({
        authenticated: true,
        requiresTwoFactor: false,
      }),
    } as unknown as AuthenticateUser;

    const createSession = {
      execute: jest.fn().mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    } as unknown as CreateSessionUseCase;

    const verifyTwoFactorAuthentication = {
      execute: jest.fn(),
    } as unknown as VerifyTwoFactorAuthenticationUseCase;

    const controller = new IdentityController(
      {} as CreateUserUseCase,
      authenticateUser,
      createSession,
      {} as RefreshSessionUseCase,
      {} as LogoutSessionUseCase,
      {} as ResetPasswordUseCase,
      {} as VerifyEmailUseCase,
      verifyTwoFactorAuthentication,
      {} as SsoProviderRegistry,
      {} as AuthenticateSsoUseCase,
      createSsoStateStore(),
    );

    const result = await controller.authenticate(
      {
        userId: 'user-id',
        password: 'plain-password',
      },
      {
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
        ip: '192.168.0.10',
      },
    );

    expect(authenticateUser.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      password: 'plain-password',
    });

    expect(verifyTwoFactorAuthentication.execute).not.toHaveBeenCalled();

    expect(createSession.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      deviceName: 'Mozilla/5.0',
      userAgent: 'Mozilla/5.0',
      ipAddress: '192.168.0.10',
    });

    expect(result).toEqual({
      authenticated: true,
      requiresTwoFactor: false,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('should require two-factor authentication before creating a session', async () => {
    const authenticateUser = {
      execute: jest.fn().mockResolvedValue({
        authenticated: true,
        requiresTwoFactor: true,
      }),
    } as unknown as AuthenticateUser;

    const createSession = {
      execute: jest.fn(),
    } as unknown as CreateSessionUseCase;

    const verifyTwoFactorAuthentication = {
      execute: jest.fn(),
    } as unknown as VerifyTwoFactorAuthenticationUseCase;

    const controller = new IdentityController(
      {} as CreateUserUseCase,
      authenticateUser,
      createSession,
      {} as RefreshSessionUseCase,
      {} as LogoutSessionUseCase,
      {} as ResetPasswordUseCase,
      {} as VerifyEmailUseCase,
      verifyTwoFactorAuthentication,
      {} as SsoProviderRegistry,
      {} as AuthenticateSsoUseCase,
      createSsoStateStore(),
    );

    const result = await controller.authenticate(
      {
        userId: 'user-id',
        password: 'plain-password',
      },
      {
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
        ip: '192.168.0.10',
      },
    );

    expect(result).toEqual({
      authenticated: false,
      requiresTwoFactor: true,
    });

    expect(verifyTwoFactorAuthentication.execute).not.toHaveBeenCalled();

    expect(createSession.execute).not.toHaveBeenCalled();
  });

  it('should create a session after valid two-factor authentication', async () => {
    const createSession = {
      execute: jest.fn().mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    } as unknown as CreateSessionUseCase;

    const verifyTwoFactorAuthentication = {
      execute: jest.fn().mockResolvedValue(true),
    } as unknown as VerifyTwoFactorAuthenticationUseCase;

    const controller = new IdentityController(
      {} as CreateUserUseCase,
      {} as AuthenticateUser,
      createSession,
      {} as RefreshSessionUseCase,
      {} as LogoutSessionUseCase,
      {} as ResetPasswordUseCase,
      {} as VerifyEmailUseCase,
      verifyTwoFactorAuthentication,
      {} as SsoProviderRegistry,
      {} as AuthenticateSsoUseCase,
      createSsoStateStore(),
    );

    const result = await controller.authenticateTwoFactor(
      {
        userId: 'user-id',
        code: '123456',
      },
      {
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
        ip: '192.168.0.10',
      },
    );

    expect(verifyTwoFactorAuthentication.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      code: '123456',
    });

    expect(createSession.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      deviceName: 'Mozilla/5.0',
      userAgent: 'Mozilla/5.0',
      ipAddress: '192.168.0.10',
    });

    expect(result).toEqual({
      authenticated: true,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('should reject an invalid two-factor authentication code', async () => {
    const createSession = {
      execute: jest.fn(),
    } as unknown as CreateSessionUseCase;

    const verifyTwoFactorAuthentication = {
      execute: jest.fn().mockResolvedValue(false),
    } as unknown as VerifyTwoFactorAuthenticationUseCase;

    const controller = new IdentityController(
      {} as CreateUserUseCase,
      {} as AuthenticateUser,
      createSession,
      {} as RefreshSessionUseCase,
      {} as LogoutSessionUseCase,
      {} as ResetPasswordUseCase,
      {} as VerifyEmailUseCase,
      verifyTwoFactorAuthentication,
      {} as SsoProviderRegistry,
      {} as AuthenticateSsoUseCase,
      createSsoStateStore(),
    );

    await expect(
      controller.authenticateTwoFactor(
        {
          userId: 'user-id',
          code: 'wrong-code',
        },
        {
          headers: {
            'user-agent': 'Mozilla/5.0',
          },
          ip: '192.168.0.10',
        },
      ),
    ).rejects.toThrow(
      new UnauthorizedException({
        authenticated: false,
      }),
    );

    expect(createSession.execute).not.toHaveBeenCalled();
  });

  it('should reject invalid credentials', async () => {
    const authenticateUser = {
      execute: jest.fn().mockResolvedValue({
        authenticated: false,
        requiresTwoFactor: false,
      }),
    } as unknown as AuthenticateUser;

    const createSession = {
      execute: jest.fn(),
    } as unknown as CreateSessionUseCase;

    const verifyTwoFactorAuthentication = {
      execute: jest.fn(),
    } as unknown as VerifyTwoFactorAuthenticationUseCase;

    const controller = new IdentityController(
      {} as CreateUserUseCase,
      authenticateUser,
      createSession,
      {} as RefreshSessionUseCase,
      {} as LogoutSessionUseCase,
      {} as ResetPasswordUseCase,
      {} as VerifyEmailUseCase,
      verifyTwoFactorAuthentication,
      {} as SsoProviderRegistry,
      {} as AuthenticateSsoUseCase,
      createSsoStateStore(),
    );

    await expect(
      controller.authenticate(
        {
          userId: 'user-id',
          password: 'wrong-password',
        },
        {
          headers: {
            'user-agent': 'Mozilla/5.0',
          },
          ip: '192.168.0.10',
        },
      ),
    ).rejects.toThrow(
      new UnauthorizedException({
        authenticated: false,
      }),
    );

    expect(authenticateUser.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      password: 'wrong-password',
    });

    expect(createSession.execute).not.toHaveBeenCalled();

    expect(verifyTwoFactorAuthentication.execute).not.toHaveBeenCalled();
  });

  it('should verify a user email', async () => {
    const verifyEmail = {
      execute: jest.fn(),
    } as unknown as VerifyEmailUseCase;

    const controller = new IdentityController(
      {} as CreateUserUseCase,
      {} as AuthenticateUser,
      {} as CreateSessionUseCase,
      {} as RefreshSessionUseCase,
      {} as LogoutSessionUseCase,
      {} as ResetPasswordUseCase,
      verifyEmail,
      {} as VerifyTwoFactorAuthenticationUseCase,
      {} as SsoProviderRegistry,
      {} as AuthenticateSsoUseCase,
      createSsoStateStore(),
    );

    await controller.verifyEmailAddress({
      userId: 'user-id',
      token: 'verification-token',
    });

    expect(verifyEmail.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      token: 'verification-token',
    });
  });

  it('should save the SSO state before creating the authorization URL', async () => {
    const ssoProvider: SsoProvider = {
      getName: jest.fn().mockReturnValue('google'),
      createAuthorizationUrl: jest.fn().mockResolvedValue({
        authorizationUrl: 'https://accounts.google.com/oauth',
        state: 'generated-state',
      }),
      authenticate: jest.fn(),
    };

    const ssoProviderRegistry = {
      get: jest.fn().mockReturnValue(ssoProvider),
    } as unknown as SsoProviderRegistry;

    const ssoStateStore = {
      save: jest.fn(),
      consume: jest.fn(),
    } as unknown as SsoStateStore;

    const controller = new IdentityController(
      {} as CreateUserUseCase,
      {} as AuthenticateUser,
      {} as CreateSessionUseCase,
      {} as RefreshSessionUseCase,
      {} as LogoutSessionUseCase,
      {} as ResetPasswordUseCase,
      {} as VerifyEmailUseCase,
      {} as VerifyTwoFactorAuthenticationUseCase,
      ssoProviderRegistry,
      {} as AuthenticateSsoUseCase,
      ssoStateStore,
    );

    const result = await controller.ssoAuthorization({
      params: {
        provider: 'google',
      },
    });

    expect(ssoProviderRegistry.get).toHaveBeenCalledWith('google');

    expect(ssoStateStore.save).toHaveBeenCalledTimes(1);

    expect(ssoProvider.createAuthorizationUrl).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      authorizationUrl: 'https://accounts.google.com/oauth',
      state: 'generated-state',
    });
  });

  it('should authenticate SSO after consuming a valid state', async () => {
    const ssoProvider: SsoProvider = {
      getName: jest.fn().mockReturnValue('google'),
      createAuthorizationUrl: jest.fn(),
      authenticate: jest.fn(),
    };

    const ssoProviderRegistry = {
      get: jest.fn().mockReturnValue(ssoProvider),
    } as unknown as SsoProviderRegistry;

    const ssoStateStore = {
      save: jest.fn(),
      consume: jest.fn().mockResolvedValue(true),
    } as unknown as SsoStateStore;

    const authenticateSso = {
      execute: jest.fn().mockResolvedValue({
        userId: 'user-id',
        provider: 'google',
        isNewIdentity: false,
      }),
    } as unknown as AuthenticateSsoUseCase;

    const createSession = {
      execute: jest.fn().mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    } as unknown as CreateSessionUseCase;

    const controller = new IdentityController(
      {} as CreateUserUseCase,
      {} as AuthenticateUser,
      createSession,
      {} as RefreshSessionUseCase,
      {} as LogoutSessionUseCase,
      {} as ResetPasswordUseCase,
      {} as VerifyEmailUseCase,
      {} as VerifyTwoFactorAuthenticationUseCase,
      ssoProviderRegistry,
      authenticateSso,
      ssoStateStore,
    );

    const result = await controller.ssoCallback({
      params: {
        provider: 'google',
      },
      query: {
        code: 'authorization-code',
        state: 'state-123',
      },
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
      ip: '192.168.0.10',
    });

    expect(ssoStateStore.consume).toHaveBeenCalledWith('state-123');

    expect(authenticateSso.execute).toHaveBeenCalledWith({
      provider: ssoProvider,
      code: 'authorization-code',
      state: 'state-123',
    });

    expect(createSession.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      deviceName: 'Mozilla/5.0',
      userAgent: 'Mozilla/5.0',
      ipAddress: '192.168.0.10',
    });

    expect(result).toEqual({
      authenticated: true,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('should reject an invalid SSO state', async () => {
    const ssoProvider: SsoProvider = {
      getName: jest.fn().mockReturnValue('google'),
      createAuthorizationUrl: jest.fn(),
      authenticate: jest.fn(),
    };

    const ssoProviderRegistry = {
      get: jest.fn().mockReturnValue(ssoProvider),
    } as unknown as SsoProviderRegistry;

    const ssoStateStore = {
      save: jest.fn(),
      consume: jest.fn().mockResolvedValue(false),
    } as unknown as SsoStateStore;

    const authenticateSso = {
      execute: jest.fn(),
    } as unknown as AuthenticateSsoUseCase;

    const createSession = {
      execute: jest.fn(),
    } as unknown as CreateSessionUseCase;

    const controller = new IdentityController(
      {} as CreateUserUseCase,
      {} as AuthenticateUser,
      createSession,
      {} as RefreshSessionUseCase,
      {} as LogoutSessionUseCase,
      {} as ResetPasswordUseCase,
      {} as VerifyEmailUseCase,
      {} as VerifyTwoFactorAuthenticationUseCase,
      ssoProviderRegistry,
      authenticateSso,
      ssoStateStore,
    );

    await expect(
      controller.ssoCallback({
        params: {
          provider: 'google',
        },
        query: {
          code: 'authorization-code',
          state: 'invalid-state',
        },
        headers: {},
      }),
    ).rejects.toThrow(
      new UnauthorizedException({
        authenticated: false,
      }),
    );

    expect(authenticateSso.execute).not.toHaveBeenCalled();

    expect(createSession.execute).not.toHaveBeenCalled();
  });

  it('should reject an SSO callback without code or state', async () => {
    const ssoStateStore = {
      save: jest.fn(),
      consume: jest.fn(),
    } as unknown as SsoStateStore;

    const controller = new IdentityController(
      {} as CreateUserUseCase,
      {} as AuthenticateUser,
      {} as CreateSessionUseCase,
      {} as RefreshSessionUseCase,
      {} as LogoutSessionUseCase,
      {} as ResetPasswordUseCase,
      {} as VerifyEmailUseCase,
      {} as VerifyTwoFactorAuthenticationUseCase,
      {} as SsoProviderRegistry,
      {} as AuthenticateSsoUseCase,
      ssoStateStore,
    );

    await expect(
      controller.ssoCallback({
        params: {
          provider: 'google',
        },
        query: {},
        headers: {},
      }),
    ).rejects.toThrow(
      new UnauthorizedException({
        authenticated: false,
      }),
    );

    expect(ssoStateStore.consume).not.toHaveBeenCalled();
  });
});
