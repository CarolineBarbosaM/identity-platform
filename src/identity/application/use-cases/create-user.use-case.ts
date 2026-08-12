import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { User } from '../../domain/entities/user.entity';

import {
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository';

import type {
  UserRepository,
} from '../../domain/repositories/user.repository';

import {
  PASSWORD_CREDENTIAL_REPOSITORY,
} from '../../domain/repositories/password-credential.repository';

import type {
  PasswordCredentialRepository,
} from '../../domain/repositories/password-credential.repository';

import {
  PASSWORD_HASHER,
} from '../../domain/services/password-hasher';

import type {
  PasswordHasher,
} from '../../domain/services/password-hasher';

import { CLOCK } from '../../../shared/domain/clock';

import type {
  Clock,
} from '../../../shared/domain/clock';

import { PasswordCredential } from '../../domain/entities/password-credential.entity';

import { CreateEmailVerificationTokenUseCase } from './create-email-verification-token.use-case';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface CreateUserOutput {
  user: User;
}

export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(PASSWORD_CREDENTIAL_REPOSITORY)
    private readonly passwordCredentialRepository: PasswordCredentialRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(CLOCK)
    private readonly clock: Clock,

    private readonly createEmailVerificationToken: CreateEmailVerificationTokenUseCase,
  ) {}

  async execute(
    input: CreateUserInput,
  ): Promise<CreateUserOutput> {
    const existingUser =
      await this.userRepository.findByEmail(
        input.email,
      );

    if (existingUser) {
      throw new Error(
        'User with this email already exists',
      );
    }

    const user = User.create(
      {
        id: randomUUID(),
        name: input.name,
        email: input.email,
      },
      this.clock,
    );

    const passwordHash =
      await this.passwordHasher.hash(
        input.password,
      );

    const passwordCredential =
      PasswordCredential.create(
        {
          id: randomUUID(),
          userId: user.getId(),
          passwordHash,
        },
        this.clock,
      );

    await this.userRepository.save(user);

    await this.passwordCredentialRepository.save(
      passwordCredential,
    );

    await this.createEmailVerificationToken.execute({
      userId: user.getId(),
    });

    return {
      user,
    };
  }
}
