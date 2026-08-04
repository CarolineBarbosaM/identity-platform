import { PasswordCredential } from '../../domain/entities/password-credential.entity';
import { PasswordCredentialRepository } from '../../domain/repositories/password-credential.repository';

export class InMemoryPasswordCredentialRepository
  implements PasswordCredentialRepository
{
  private readonly credentials: PasswordCredential[] = [];

  async findByUserId(
    userId: string,
  ): Promise<PasswordCredential | null> {
    return (
      this.credentials.find(
        (credential) => credential.getUserId() === userId,
      ) ?? null
    );
  }

  async save(credential: PasswordCredential): Promise<void> {
    this.credentials.push(credential);
  }
}