import { IdentityController } from './identity.controller';

import { VerifyEmailUseCase } from '../../application/use-cases/verify-email.use-case';

describe('IdentityController - email verification', () => {
  it('should verify the user email', async () => {
    const verifyEmail = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as VerifyEmailUseCase;

    const controller = new IdentityController(
      {} as any, // createUser
      {} as any, // authenticateUser
      {} as any, // createSession
      {} as any, // refreshSession
      {} as any, // logoutSession
      verifyEmail,
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

  it('should propagate verification errors', async () => {
    const verifyEmail = {
      execute: jest
        .fn()
        .mockRejectedValue(
          new Error(
            'Invalid email verification token',
          ),
        ),
    } as unknown as VerifyEmailUseCase;

    const controller = new IdentityController(
      {} as any, // createUser
      {} as any, // authenticateUser
      {} as any, // createSession
      {} as any, // refreshSession
      {} as any, // logoutSession
      verifyEmail,
    );

    await expect(
      controller.verifyEmailAddress({
        userId: 'user-id',
        token: 'wrong-token',
      }),
    ).rejects.toThrow(
      'Invalid email verification token',
    );
  });
});
