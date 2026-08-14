import { SsoProviderRegistry } from './sso-provider-registry';

import type { SsoProvider } from '../../domain/services/sso-provider';

describe('SsoProviderRegistry', () => {
  const googleProvider: SsoProvider = {
    getName: jest.fn().mockReturnValue('google'),
    createAuthorizationUrl: jest.fn(),
    authenticate: jest.fn(),
  };

  const microsoftProvider: SsoProvider = {
    getName: jest.fn().mockReturnValue('microsoft'),
    createAuthorizationUrl: jest.fn(),
    authenticate: jest.fn(),
  };

  const registry = new SsoProviderRegistry([googleProvider, microsoftProvider]);

  it('should return the provider by name', () => {
    const provider = registry.get('google');

    expect(provider).toBe(googleProvider);
  });

  it('should find a provider case-insensitively', () => {
    const provider = registry.get('MICROSOFT');

    expect(provider).toBe(microsoftProvider);
  });

  it('should throw when the provider is not supported', () => {
    expect(() => registry.get('github')).toThrow(
      'SSO provider "github" is not supported',
    );
  });
});
