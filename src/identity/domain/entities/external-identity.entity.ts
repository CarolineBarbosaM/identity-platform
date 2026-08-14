export interface CreateExternalIdentityProps {
  id: string;
  userId: string;
  provider: string;
  providerUserId: string;
  email: string;
}

export class ExternalIdentity {
  private constructor(
    private readonly id: string,
    private readonly userId: string,
    private readonly provider: string,
    private readonly providerUserId: string,
    private readonly email: string,
  ) {}

  static create(props: CreateExternalIdentityProps): ExternalIdentity {
    return new ExternalIdentity(
      props.id,
      props.userId,
      props.provider,
      props.providerUserId,
      props.email,
    );
  }

  getId(): string {
    return this.id;
  }

  getUserId(): string {
    return this.userId;
  }

  getProvider(): string {
    return this.provider;
  }

  getProviderUserId(): string {
    return this.providerUserId;
  }

  getEmail(): string {
    return this.email;
  }
}
