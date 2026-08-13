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

import { User } from '../../domain/entities/user.entity';
import { UserStatus } from '../../domain/enums/user-status.enum';

describe('IdentityController', () => {
  it('should register a user', async () => {
    const user = User.create(
      {
        id: 'user-id',
        name: 'Caroline',
        email: 'caroline@example.com',
      },
      {
        now: () =>
          new Date('2026-08-12T10:00:00.000Z'),
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

    const controller = new IdentityController(
      createUser,
      authenticateUser,
      createSession,
      refreshSession,
      logoutSession,
      resetPassword,
      verifyEmail,
      verifyTwoFactorAuthentication,
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
    );

    const result = await controller.authenticate({
      userId: 'user-id',
      password: 'plain-password',
    });

    expect(authenticateUser.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      password: 'plain-password',
    });

    expect(
      verifyTwoFactorAuthentication.execute,
    ).not.toHaveBeenCalled();

    expect(createSession.execute).not.toHaveBeenCalled();

    expect(result).toEqual({
      authenticated: true,
      requiresTwoFactor: false,
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
    );

    const result = await controller.authenticate({
      userId: 'user-id',
      password: 'plain-password',
    });

    expect(result).toEqual({
      authenticated: false,
      requiresTwoFactor: true,
    });

    expect(
      verifyTwoFactorAuthentication.execute,
    ).not.toHaveBeenCalled();

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

    expect(
      verifyTwoFactorAuthentication.execute,
    ).toHaveBeenCalledWith({
      userId: 'user-id',
      code: '123456',
    });

    expect(
      createSession.execute,
    ).toHaveBeenCalledWith({
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

    expect(
      verifyTwoFactorAuthentication.execute,
    ).toHaveBeenCalledWith({
      userId: 'user-id',
      code: 'wrong-code',
    });

    expect(
      createSession.execute,
    ).not.toHaveBeenCalled();
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
    );

    await expect(
      controller.authenticate({
        userId: 'user-id',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(
      new UnauthorizedException({
        authenticated: false,
      }),
    );

    expect(
      authenticateUser.execute,
    ).toHaveBeenCalledWith({
      userId: 'user-id',
      password: 'wrong-password',
    });

    expect(
      createSession.execute,
    ).not.toHaveBeenCalled();

    expect(
      verifyTwoFactorAuthentication.execute,
    ).not.toHaveBeenCalled();
  });

  it('should use fallback values when device information is unavailable', async () => {
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
    );

    await controller.authenticateTwoFactor(
      {
        userId: 'user-id',
        code: '123456',
      },
      {
        headers: {},
      },
    );

    expect(
      createSession.execute,
    ).toHaveBeenCalledWith({
      userId: 'user-id',
      deviceName: 'unknown',
      userAgent: 'unknown',
      ipAddress: 'unknown',
    });
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
    );

    await controller.verifyEmailAddress({
      userId: 'user-id',
      token: 'verification-token',
    });

    expect(
      verifyEmail.execute,
    ).toHaveBeenCalledWith({
      userId: 'user-id',
      token: 'verification-token',
    });
  });
});
