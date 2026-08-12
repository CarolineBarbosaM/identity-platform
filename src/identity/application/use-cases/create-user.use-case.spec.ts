import { CreateUserUseCase } from './create-user.use-case';
import { InMemoryUserRepository } from '../repositories/in-memory-user.repository';
import { InMemoryPasswordCredentialRepository } from '../repositories/in-memory-password-credential.repository';
import { FakePasswordHasher } from '../services/fake-password-hasher';
import { FakeClock } from '../../../shared/domain/fake-clock';

describe('CreateUserUseCase', () => {
  it('should create a user with a password credential', async () => {
    const userRepository = new InMemoryUserRepository();
    const passwordCredentialRepository =
      new InMemoryPasswordCredentialRepository();

    const passwordHasher = new FakePasswordHasher();

    const clock = new FakeClock(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    const useCase = new CreateUserUseCase(
      userRepository,
      passwordCredentialRepository,
      passwordHasher,
      clock,
    );

    const result = await useCase.execute({
      name: 'Caroline',
      email: 'caroline@example.com',
      password: 'password123',
    });

    expect(result.user.getName()).toBe('Caroline');
    expect(result.user.getEmail()).toBe(
      'caroline@example.com',
    );

    expect(result.user.getStatus()).toBe(
      'PENDING_EMAIL_VERIFICATION',
    );

    const storedUser = await userRepository.findById(
      result.user.getId(),
    );

    expect(storedUser).toBe(result.user);

    const credential =
      await passwordCredentialRepository.findByUserId(
        result.user.getId(),
      );

    expect(credential).not.toBeNull();

    expect(credential?.getPasswordHash()).toBe(
      'hashed-password123',
    );
  });

  it('should not create a user with an existing email', async () => {
    const userRepository = new InMemoryUserRepository();
    const passwordCredentialRepository =
      new InMemoryPasswordCredentialRepository();

    const passwordHasher = new FakePasswordHasher();

    const clock = new FakeClock(
      new Date('2026-08-12T10:00:00.000Z'),
    );

    const useCase = new CreateUserUseCase(
      userRepository,
      passwordCredentialRepository,
      passwordHasher,
      clock,
    );

    await useCase.execute({
      name: 'Caroline',
      email: 'caroline@example.com',
      password: 'password123',
    });

    await expect(
      useCase.execute({
        name: 'Another User',
        email: 'caroline@example.com',
        password: 'another-password',
      }),
    ).rejects.toThrow(
      'User with this email already exists',
    );
  });
});
