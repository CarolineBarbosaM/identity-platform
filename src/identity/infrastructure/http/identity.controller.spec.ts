import { UnauthorizedException } from '@nestjs/common';

import { IdentityController } from './identity.controller';

import { AuthenticateUser } from '../../application/use-cases/authenticate-user.use-case';
import { CreateSessionUseCase } from '../../application/use-cases/create-session.use-case';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case';
import { LogoutSessionUseCase } from '../../application/use-cases/logout-session.use-case';

describe('IdentityController', () => {
  it('should authenticate a user', async () => {
    const authenticateUser = {
      execute: jest.fn().mockResolvedValue(true),
    } as unknown as AuthenticateUser;

    const createSession = {
      execute: jest.fn().mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    } as unknown as CreateSessionUseCase;

    const refreshSession = {
      execute: jest.fn(),
    } as unknown as RefreshSessionUseCase;

    const logoutSession = {
      execute: jest.fn(),
    } as unknown as LogoutSessionUseCase;

    const controller = new IdentityController(
      authenticateUser,
      createSession,
      refreshSession,
      logoutSession,
    );

    const result =
      await controller.authenticate(
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

    expect(
      authenticateUser.execute,
    ).toHaveBeenCalledWith({
      userId: 'user-id',
      password: 'plain-password',
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

  it('should reject invalid credentials', async () => {
    const authenticateUser = {
      execute: jest.fn().mockResolvedValue(false),
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

    const controller = new IdentityController(
      authenticateUser,
      createSession,
      refreshSession,
      logoutSession,
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

    expect(
      authenticateUser.execute,
    ).toHaveBeenCalledWith({
      userId: 'user-id',
      password: 'wrong-password',
    });

    expect(
      createSession.execute,
    ).not.toHaveBeenCalled();
  });

  it('should use fallback values when device information is unavailable', async () => {
    const authenticateUser = {
      execute: jest.fn().mockResolvedValue(true),
    } as unknown as AuthenticateUser;

    const createSession = {
      execute: jest.fn().mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    } as unknown as CreateSessionUseCase;

    const refreshSession = {
      execute: jest.fn(),
    } as unknown as RefreshSessionUseCase;

    const logoutSession = {
      execute: jest.fn(),
    } as unknown as LogoutSessionUseCase;

    const controller = new IdentityController(
      authenticateUser,
      createSession,
      refreshSession,
      logoutSession,
    );

    await controller.authenticate(
      {
        userId: 'user-id',
        password: 'plain-password',
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
});
