import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { AuthGuard } from './auth.guard';

import type { AccessTokenVerifier } from '../../domain/services/access-token-verifier';
import type { TokenBlacklist } from '../../domain/services/token-blacklist';

describe('AuthGuard', () => {
  it('should allow a valid access token', async () => {
    const accessTokenVerifier = {
      verify: jest.fn().mockResolvedValue({
        userId: 'user-id',
        tokenId: 'token-id',
        expiresAt: new Date('2026-08-08T20:48:43.000Z'),
      }),
    } as unknown as AccessTokenVerifier;

    const tokenBlacklist = {
      has: jest.fn().mockResolvedValue(false),
    } as unknown as TokenBlacklist;

    const guard = new AuthGuard(accessTokenVerifier, tokenBlacklist);

    const request: {
      headers: {
        authorization: string;
      };
      user?: {
        userId: string;
        tokenId: string;
        expiresAt: Date;
      };
    } = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);

    expect(accessTokenVerifier.verify).toHaveBeenCalledWith('valid-token');

    expect(tokenBlacklist.has).toHaveBeenCalledWith('token-id');

    expect(request.user).toEqual({
      userId: 'user-id',
      tokenId: 'token-id',
      expiresAt: new Date('2026-08-08T20:48:43.000Z'),
    });
  });

  it('should reject a request without authorization', async () => {
    const accessTokenVerifier = {
      verify: jest.fn(),
    } as unknown as AccessTokenVerifier;

    const tokenBlacklist = {
      has: jest.fn(),
    } as unknown as TokenBlacklist;

    const guard = new AuthGuard(accessTokenVerifier, tokenBlacklist);

    const request = {
      headers: {},
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException(),
    );

    expect(accessTokenVerifier.verify).not.toHaveBeenCalled();

    expect(tokenBlacklist.has).not.toHaveBeenCalled();
  });

  it('should reject an invalid authorization header', async () => {
    const accessTokenVerifier = {
      verify: jest.fn(),
    } as unknown as AccessTokenVerifier;

    const tokenBlacklist = {
      has: jest.fn(),
    } as unknown as TokenBlacklist;

    const guard = new AuthGuard(accessTokenVerifier, tokenBlacklist);

    const request = {
      headers: {
        authorization: 'Basic invalid-token',
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException(),
    );

    expect(accessTokenVerifier.verify).not.toHaveBeenCalled();

    expect(tokenBlacklist.has).not.toHaveBeenCalled();
  });

  it('should reject an invalid access token', async () => {
    const accessTokenVerifier = {
      verify: jest.fn().mockRejectedValue(new Error('Invalid token')),
    } as unknown as AccessTokenVerifier;

    const tokenBlacklist = {
      has: jest.fn(),
    } as unknown as TokenBlacklist;

    const guard = new AuthGuard(accessTokenVerifier, tokenBlacklist);

    const request = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException(),
    );

    expect(accessTokenVerifier.verify).toHaveBeenCalledWith('invalid-token');

    expect(tokenBlacklist.has).not.toHaveBeenCalled();
  });

  it('should reject a blacklisted access token', async () => {
    const accessTokenVerifier = {
      verify: jest.fn().mockResolvedValue({
        userId: 'user-id',
        tokenId: 'revoked-token-id',
        expiresAt: new Date('2026-08-08T20:48:43.000Z'),
      }),
    } as unknown as AccessTokenVerifier;

    const tokenBlacklist = {
      has: jest.fn().mockResolvedValue(true),
    } as unknown as TokenBlacklist;

    const guard = new AuthGuard(accessTokenVerifier, tokenBlacklist);

    const request = {
      headers: {
        authorization: 'Bearer revoked-token',
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException(),
    );

    expect(accessTokenVerifier.verify).toHaveBeenCalledWith('revoked-token');

    expect(tokenBlacklist.has).toHaveBeenCalledWith('revoked-token-id');
  });

  it('should attach authenticated user data to the request', async () => {
    const accessTokenVerifier = {
      verify: jest.fn().mockResolvedValue({
        userId: 'user-id',
        tokenId: 'token-id',
        expiresAt: new Date('2026-08-08T21:00:00.000Z'),
      }),
    } as unknown as AccessTokenVerifier;

    const tokenBlacklist = {
      has: jest.fn().mockResolvedValue(false),
    } as unknown as TokenBlacklist;

    const guard = new AuthGuard(accessTokenVerifier, tokenBlacklist);

    const request: {
      headers: {
        authorization: string;
      };
      user: {
        userId: string;
        tokenId: string;
        expiresAt: Date;
      };
    } = {
      headers: {
        authorization: 'Bearer access-token',
      },
      user: {
        userId: '',
        tokenId: '',
        expiresAt: new Date(0),
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);

    expect(accessTokenVerifier.verify).toHaveBeenCalledWith('access-token');

    expect(tokenBlacklist.has).toHaveBeenCalledWith('token-id');

    expect(request.user).toEqual({
      userId: 'user-id',
      tokenId: 'token-id',
      expiresAt: new Date('2026-08-08T21:00:00.000Z'),
    });
  });
});
