import { Inject } from '@nestjs/common';

import { SSO_PROVIDERS, SsoProvider } from '../../domain/services/sso-provider';

export class SsoProviderRegistry {
  constructor(
    @Inject(SSO_PROVIDERS)
    private readonly providers: SsoProvider[],
  ) {}

  get(providerName: string): SsoProvider {
    const provider = this.providers.find(
      (item) => item.getName().toLowerCase() === providerName.toLowerCase(),
    );

    if (!provider) {
      throw new Error(`SSO provider "${providerName}" is not supported`);
    }

    return provider;
  }
}
