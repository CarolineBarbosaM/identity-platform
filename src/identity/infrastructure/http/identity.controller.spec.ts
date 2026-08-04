import { IdentityController } from './identity.controller';
import { AuthenticateUser } from '../../application/use-cases/authenticate-user.use-case';

describe('IdentityController', () => {
  it('should authenticate a user', async () => {
    const authenticateUser = {
      execute: jest.fn().mockResolvedValue(true),
    } as unknown as AuthenticateUser;

    const controller = new IdentityController(authenticateUser);

    const result = await controller.authenticate({
      userId: 'user-id',
      password: 'plain-password',
    });

    expect(authenticateUser.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      password: 'plain-password',
    });

    expect(result).toBe(true);
  });

    it('should reject invalid credentials', async () => {
        const authenticateUser = {
            execute: jest.fn().mockResolvedValue(false),
        } as unknown as AuthenticateUser;

        const controller = new IdentityController(authenticateUser);

        const result = await controller.authenticate({
            userId: 'user-id',
            password: 'wrong-password',
        });

        expect(authenticateUser.execute).toHaveBeenCalledWith({
            userId: 'user-id',
            password: 'wrong-password',
        });

        expect(result).toBe(false);
    });
});
