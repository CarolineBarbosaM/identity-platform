import { PasswordCredential } from '../../domain/entities/password-credential.entity';
import { PasswordHasher } from '../../domain/services/password-hasher';
import { CreatePasswordCredential } from './create-password-credential.use-case';
import { FakeClock } from '../../../shared/domain/fake-clock';

describe('CreatePasswordCredential', () => {
  it('should create a password credential with a hashed password', async () => {
    const passwordHasher: PasswordHasher = {
      hash: jest.fn().mockResolvedValue('hashed-password'),
      compare: jest.fn(),
    };

    const clock = new FakeClock(new Date('2026-08-04T10:00:00.000Z'));

    const useCase = new CreatePasswordCredential(passwordHasher, clock);

    const credential = await useCase.execute({
      id: 'credential-id',
      userId: 'user-id',
      password: 'plain-password',
    });

    expect(passwordHasher.hash).toHaveBeenCalledWith('plain-password');

    expect(credential).toBeInstanceOf(PasswordCredential);
    expect(credential.getPasswordHash()).toBe('hashed-password');
    expect(credential.getUserId()).toBe('user-id');
  });
});
