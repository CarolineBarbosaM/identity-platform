import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import type { AccessTokenVerifier } from '../../domain/services/access-token-verifier';

describe('AuthGuard', () => {
    it('should allow a valid access token', async () => {
        const accessTokenVerifier = {
            verify: jest.fn().mockResolvedValue({
                userId: 'user-id',
            }),
        } as unknown as AccessTokenVerifier;

        const guard = new AuthGuard(
            accessTokenVerifier,
        );

        const request: {
            headers: {
                authorization: string;
            };
            user?: {
                userId: string;
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

        expect(
            accessTokenVerifier.verify,
        ).toHaveBeenCalledWith(
            'valid-token',
        );

        expect(request.user).toEqual({
            userId: 'user-id',
        });
    });

    it('should reject a request without authorization', async () => {
        const accessTokenVerifier = {
            verify: jest.fn(),
        } as unknown as AccessTokenVerifier;

        
        const guard = new AuthGuard(
            accessTokenVerifier,
        );

        const request = {
            headers: {},
        };

        const context = {
            switchToHttp: () => ({
                getRequest: () => request,
            }),
        } as ExecutionContext;

        await expect(
            guard.canActivate(context),
        ).rejects.toThrow(
            new UnauthorizedException(),
        );

        expect(
            accessTokenVerifier.verify,
        ).not.toHaveBeenCalled();
    });

    it('should reject an invalid authorization header', async () => {
        const accessTokenVerifier = {
            verify: jest.fn(),
        } as unknown as AccessTokenVerifier;

    
        const guard = new AuthGuard(
            accessTokenVerifier,
        );

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

        await expect(
            guard.canActivate(context),
        ).rejects.toThrow(
            new UnauthorizedException(),
        );

        expect(
            accessTokenVerifier.verify,
        ).not.toHaveBeenCalled();
    });

    it('should reject an invalid access token', async () => {
        const accessTokenVerifier = {
            verify: jest.fn().mockRejectedValue(new Error('Invalid token')),
        } as unknown as AccessTokenVerifier;


        const guard = new AuthGuard(
            accessTokenVerifier,
        );

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

        await expect(
            guard.canActivate(context),
        ).rejects.toThrow(
            new UnauthorizedException(),
        );

        expect(
            accessTokenVerifier.verify,
        ).toHaveBeenCalledWith(
            'invalid-token',
        );
    });
});
