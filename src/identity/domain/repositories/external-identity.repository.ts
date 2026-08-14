import { ExternalIdentity } from '../entities/external-identity.entity';

export interface ExternalIdentityRepository {
  findByProviderAndProviderUserId(
    provider: string,
    providerUserId: string,
  ): Promise<ExternalIdentity | null>;

  findByUserId(
    userId: string,
  ): Promise<ExternalIdentity[]>;

  save(
    externalIdentity: ExternalIdentity,
  ): Promise<void>;
}

export const EXTERNAL_IDENTITY_REPOSITORY = Symbol(
  'EXTERNAL_IDENTITY_REPOSITORY',
);
