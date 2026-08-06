import { UnauthorizedException } from '@nestjs/common';
import { IdentityController } from './identity.controller';
import { AuthenticateUser } from '../../application/use-cases/authenticate-user.use-case';
import { CreateSessionUseCase } from '../../application/use-cases/create-session.use-case';

describe('IdentityController', () => {
  it('should authenticate a user', async () => {
    const authenticateUser = {
      execute: jest.fn().mockResolvedValue(true),
    } as unknown as AuthenticateUser;

    const createSession = {
      execute: jest.fn().mockResolvedValue({
        refreshToken: 'refresh-token',
      }),
    } as unknown as CreateSessionUseCase;

    const controller = new IdentityController(
      authenticateUser,
      createSession,
    );

    const result = await controller.authenticate({
      userId: 'user-id',
      password: 'plain-password',
    });

    expect(authenticateUser.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      password: 'plain-password',
    });

    expect(createSession.execute).toHaveBeenCalledWith({
      userId: 'user-id',
    });

    expect(result).toEqual({
      authenticated: true,
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

    const controller = new IdentityController(
      authenticateUser,
      createSession,
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

    expect(authenticateUser.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      password: 'wrong-password',
    });

    expect(createSession.execute).not.toHaveBeenCalled();
  });
});
