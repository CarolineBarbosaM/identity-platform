import { PasswordHasher } from '../../domain/services/password-hasher';
import { PasswordCredentialRepository } from '../../domain/repositories/password-credential.repository';

export interface AuthenticateUserInput {
  userId: string;
  password: string;
}

export class AuthenticateUser {
  constructor(
    private readonly repository: PasswordCredentialRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: AuthenticateUserInput): Promise<boolean> {
    const credential = await this.repository.findByUserId(input.userId);

    if (!credential) {
      return false;
    }

    return this.passwordHasher.compare(
      input.password,
      credential.getPasswordHash(),
    );
  }
}