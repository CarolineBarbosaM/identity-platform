import { PasswordCredential } from '../entities/password-credential.entity';

export interface PasswordCredentialRepository {
  findByUserId(userId: string): Promise<PasswordCredential | null>;
  save(credential: PasswordCredential): Promise<void>;
}