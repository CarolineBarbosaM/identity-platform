import { PasswordCredential } from '../../domain/entities/password-credential.entity';
import { PasswordHasher } from '../../domain/services/password-hasher';
import { Clock } from '../../../shared/domain/clock';

export interface CreatePasswordCredentialInput {
  id: string;
  userId: string;
  password: string;
}

export class CreatePasswordCredential {
  constructor(
    private readonly passwordHasher: PasswordHasher,
    private readonly clock: Clock,
  ) {}

  async execute(
    input: CreatePasswordCredentialInput,
  ): Promise<PasswordCredential> {
    const passwordHash = await this.passwordHasher.hash(input.password);

    return PasswordCredential.create(
      {
        id: input.id,
        userId: input.userId,
        passwordHash,
      },
      this.clock,
    );
  }
}