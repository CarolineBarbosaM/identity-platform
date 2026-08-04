import { Inject } from '@nestjs/common';
import { PasswordCredential } from '../../domain/entities/password-credential.entity';
import { PASSWORD_HASHER } from '../../domain/services/password-hasher';
import type { PasswordHasher } from '../../domain/services/password-hasher';
import { CLOCK } from '../../../shared/domain/clock';
import type { Clock } from '../../../shared/domain/clock';

export interface CreatePasswordCredentialInput {
  id: string;
  userId: string;
  password: string;
}

export class CreatePasswordCredential {
  constructor(
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(CLOCK)
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