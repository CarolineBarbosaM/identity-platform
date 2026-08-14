import type { PasswordHasher } from '../../domain/services/password-hasher';

export class FakePasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return `hashed-${password}`;
  }

  async compare(password: string, passwordHash: string): Promise<boolean> {
    return passwordHash === `hashed-${password}`;
  }
}
