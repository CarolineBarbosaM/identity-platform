import { IdentityController } from './identity.controller';

import { AuthenticateUser } from '../../application/use-cases/authenticate-user.use-case';
import { CreateSessionUseCase } from '../../application/use-cases/create-session.use-case';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case';
import { LogoutSessionUseCase } from '../../application/use-cases/logout-session.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';

describe('IdentityController - password reset', () => {
  it('should reset the user password', async () => {
    const authenticateUser =
      {} as AuthenticateUser;

    const createSession =
      {} as CreateSessionUseCase;

    const refreshSession =
      {} as RefreshSessionUseCase;

    const logoutSession =
      {} as LogoutSessionUseCase;

    const resetPassword = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as ResetPasswordUseCase;

    const controller = new IdentityController(
      authenticateUser,
      createSession,
      refreshSession,
      logoutSession,
      resetPassword,
    );

    await controller.resetPassword({
      userId: 'user-id',
      token: 'reset-token',
      newPassword: 'new-password',
    });

    expect(
      resetPassword.execute,
    ).toHaveBeenCalledWith({
      userId: 'user-id',
      token: 'reset-token',
      newPassword: 'new-password',
    });
  });

  it('should propagate password reset errors', async () => {
    const authenticateUser =
      {} as AuthenticateUser;

    const createSession =
      {} as CreateSessionUseCase;

    const refreshSession =
      {} as RefreshSessionUseCase;

    const logoutSession =
      {} as LogoutSessionUseCase;

    const resetPassword = {
      execute: jest
        .fn()
        .mockRejectedValue(
          new Error(
            'Invalid password reset token',
          ),
        ),
    } as unknown as ResetPasswordUseCase;

    const controller = new IdentityController(
      authenticateUser,
      createSession,
      refreshSession,
      logoutSession,
      resetPassword,
    );

    await expect(
      controller.resetPassword({
        userId: 'user-id',
        token: 'wrong-token',
        newPassword: 'new-password',
      }),
    ).rejects.toThrow(
      'Invalid password reset token',
    );
  });
});
