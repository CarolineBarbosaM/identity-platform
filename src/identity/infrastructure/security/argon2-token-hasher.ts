import * as argon2 from 'argon2';

import type { TokenHasher } from '../../domain/services/token-hasher';

export class Argon2TokenHasher implements TokenHasher {
  async hash(token: string): Promise<string> {
    return argon2.hash(token, {
      type: argon2.argon2id,
    });
  }

  async compare(token: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, token);
  }
}
