import { IdentityController } from './identity.controller';

import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { AuthenticateUser } from '../../application/use-cases/authenticate-user.use-case';
import { CreateSessionUseCase } from '../../application/use-cases/create-session.use-case';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case';
import { LogoutSessionUseCase } from '../../application/use-cases/logout-session.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { VerifyEmailUseCase } from '../../application/use-cases/verify-email.use-case';
import { VerifyTwoFactorAuthenticationUseCase } from '../../application/use-cases/verify-two-factor-authentication.use-case';
import { SsoProviderRegistry } from '../../application/services/sso-provider-registry';
import { AuthenticateSsoUseCase } from '../../application/use-cases/authenticate-sso.use-case';
import { SsoStateStore } from '../../../identity/domain/services/sso-state-store';

describe('IdentityController - email verification', () => {
  it('should verify the user email', async () => {
    const createUser = {} as CreateUserUseCase;

    const authenticateUser = {} as AuthenticateUser;

    const createSession = {} as CreateSessionUseCase;

    const refreshSession = {} as RefreshSessionUseCase;

    const logoutSession = {} as LogoutSessionUseCase;

    const resetPassword = {} as ResetPasswordUseCase;

    const verifyEmail = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as VerifyEmailUseCase;

    const controller = new IdentityController(
      createUser,
      authenticateUser,
      createSession,
      refreshSession,
      logoutSession,
      resetPassword,
      verifyEmail,
      {} as VerifyTwoFactorAuthenticationUseCase,
      {} as SsoProviderRegistry,
      {} as AuthenticateSsoUseCase,
      {} as SsoStateStore,
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

  it('should propagate verification errors', async () => {
    const createUser = {} as CreateUserUseCase;

    const authenticateUser = {} as AuthenticateUser;

    const createSession = {} as CreateSessionUseCase;

    const refreshSession = {} as RefreshSessionUseCase;

    const logoutSession = {} as LogoutSessionUseCase;

    const resetPassword = {} as ResetPasswordUseCase;

    const verifyEmail = {
      execute: jest
        .fn()
        .mockRejectedValue(new Error('Invalid email verification token')),
    } as unknown as VerifyEmailUseCase;

    const controller = new IdentityController(
      createUser,
      authenticateUser,
      createSession,
      refreshSession,
      logoutSession,
      resetPassword,
      verifyEmail,
      {} as VerifyTwoFactorAuthenticationUseCase,
      {} as SsoProviderRegistry,
      {} as AuthenticateSsoUseCase,
      {} as SsoStateStore,
    );

    await expect(
      controller.verifyEmailAddress({
        userId: 'user-id',
        token: 'wrong-token',
      }),
    ).rejects.toThrow('Invalid email verification token');
  });
});
