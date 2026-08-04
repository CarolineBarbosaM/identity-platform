import { PasswordCredential } from '../entities/password-credential.entity';

export const PASSWORD_CREDENTIAL_REPOSITORY = Symbol(
  'PASSWORD_CREDENTIAL_REPOSITORY',
);

export interface PasswordCredentialRepository {
  findByUserId(userId: string): Promise<PasswordCredential | null>;
  save(credential: PasswordCredential): Promise<void>;
}