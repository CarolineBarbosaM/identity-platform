import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { randomUUID } from 'crypto';

import { AuthenticateUser } from '../../application/use-cases/authenticate-user.use-case';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { CreateSessionUseCase } from '../../application/use-cases/create-session.use-case';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case';
import { LogoutSessionUseCase } from '../../application/use-cases/logout-session.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { VerifyEmailUseCase } from '../../application/use-cases/verify-email.use-case';
import { VerifyTwoFactorAuthenticationUseCase } from '../../application/use-cases/verify-two-factor-authentication.use-case';

import { SsoProviderRegistry } from '../../application/services/sso-provider-registry';
import { AuthenticateSsoUseCase } from '../../application/use-cases/authenticate-sso.use-case';

import { SSO_STATE_STORE } from '../../domain/services/sso-state-store';
import type { SsoStateStore } from '../../domain/services/sso-state-store';

import { AuthGuard } from './auth.guard';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthenticateRequest {
  userId: string;
  password: string;
}

export interface VerifyTwoFactorRequest {
  userId: string;
  code: string;
}

export interface ResetPasswordRequest {
  userId: string;
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  userId: string;
  token: string;
}

export interface DeviceRequest {
  headers: {
    'user-agent'?: string;
  };
  ip?: string;
}

@Controller('auth')
export class IdentityController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly authenticateUser: AuthenticateUser,
    private readonly createSession: CreateSessionUseCase,
    private readonly refreshSession: RefreshSessionUseCase,
    private readonly logoutSession: LogoutSessionUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly verifyEmail: VerifyEmailUseCase,
    private readonly verifyTwoFactorAuthentication: VerifyTwoFactorAuthenticationUseCase,
    private readonly ssoProviderRegistry: SsoProviderRegistry,
    private readonly authenticateSso: AuthenticateSsoUseCase,
    @Inject(SSO_STATE_STORE)
    private readonly ssoStateStore: SsoStateStore,
  ) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() request: RegisterRequest): Promise<{
    id: string;
    name: string;
    email: string;
    status: string;
  }> {
    const { user } = await this.createUser.execute({
      name: request.name,
      email: request.email,
      password: request.password,
    });

    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      status: user.getStatus(),
    };
  }

  @Post('login')
  @HttpCode(200)
  async authenticate(
    @Body() request: AuthenticateRequest,
    @Req() httpRequest: DeviceRequest,
  ): Promise<{
    authenticated: boolean;
    requiresTwoFactor: boolean;
    accessToken?: string;
    refreshToken?: string;
  }> {
    const authentication = await this.authenticateUser.execute({
      userId: request.userId,
      password: request.password,
    });

    if (!authentication.authenticated) {
      throw new UnauthorizedException({
        authenticated: false,
      });
    }

    if (authentication.requiresTwoFactor) {
      return {
        authenticated: false,
        requiresTwoFactor: true,
      };
    }

    const userAgent = httpRequest.headers['user-agent'] ?? 'unknown';

    const ipAddress = httpRequest.ip ?? 'unknown';

    const { accessToken, refreshToken } =
      await this.createSession.execute({
        userId: request.userId,
        deviceName: userAgent,
        userAgent,
        ipAddress,
      });

    return {
      authenticated: true,
      requiresTwoFactor: false,
      accessToken,
      refreshToken,
    };
  }

  @Post('login/2fa')
  @HttpCode(200)
  async authenticateTwoFactor(
    @Body() request: VerifyTwoFactorRequest,
    @Req() httpRequest: DeviceRequest,
  ): Promise<{
    authenticated: boolean;
    accessToken: string;
    refreshToken: string;
  }> {
    const validTwoFactor =
      await this.verifyTwoFactorAuthentication.execute({
        userId: request.userId,
        code: request.code,
      });

    if (!validTwoFactor) {
      throw new UnauthorizedException({
        authenticated: false,
      });
    }

    const userAgent =
      httpRequest.headers['user-agent'] ?? 'unknown';

    const ipAddress =
      httpRequest.ip ?? 'unknown';

    const { accessToken, refreshToken } =
      await this.createSession.execute({
        userId: request.userId,
        deviceName: userAgent,
        userAgent,
        ipAddress,
      });

    return {
      authenticated: true,
      accessToken,
      refreshToken,
    };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Body()
    request: {
      refreshToken: string;
    },
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    return this.refreshSession.execute({
      refreshToken: request.refreshToken,
    });
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async logout(
    @Body()
    body: {
      sessionId: string;
    },
    @Req()
    request: {
      user: {
        userId: string;
        tokenId: string;
        expiresAt: Date;
      };
    },
  ): Promise<void> {
    await this.logoutSession.execute({
      sessionId: body.sessionId,
      userId: request.user.userId,
      tokenId: request.user.tokenId,
      expiresAt: request.user.expiresAt,
    });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(
    @Req()
    request: {
      user: {
        userId: string;
      };
    },
  ): Promise<{
    userId: string;
  }> {
    return request.user;
  }

  @Post('password/reset')
  @HttpCode(204)
  async resetPassword(
    @Body() request: ResetPasswordRequest,
  ): Promise<void> {
    await this.resetPasswordUseCase.execute({
      userId: request.userId,
      token: request.token,
      newPassword: request.newPassword,
    });
  }

  @Post('email/verify')
  @HttpCode(204)
  async verifyEmailAddress(
    @Body() request: VerifyEmailRequest,
  ): Promise<void> {
    await this.verifyEmail.execute({
      userId: request.userId,
      token: request.token,
    });
  }

  @Get('sso/:provider')
  async ssoAuthorization(
    @Req()
    request: {
      params: {
        provider: string;
      };
    },
  ): Promise<{
    authorizationUrl: string;
    state: string;
  }> {
    const provider =
      this.ssoProviderRegistry.get(
        request.params.provider,
      );

    const state = randomUUID();

    await this.ssoStateStore.save(state);

    return provider.createAuthorizationUrl(state);
  }

  @Get('sso/:provider/callback')
  @HttpCode(200)
  async ssoCallback(
    @Req()
    request: {
      params: {
        provider: string;
      };
      query: {
        code?: string;
        state?: string;
      };
      headers: {
        'user-agent'?: string;
      };
      ip?: string;
    },
  ): Promise<{
    authenticated: boolean;
    accessToken: string;
    refreshToken: string;
  }> {
    const code = request.query.code;
    const state = request.query.state;

    if (!code || !state) {
      throw new UnauthorizedException({
        authenticated: false,
      });
    }

    const validState =
      await this.ssoStateStore.consume(state);

    if (!validState) {
      throw new UnauthorizedException({
        authenticated: false,
      });
    }

    const provider =
      this.ssoProviderRegistry.get(
        request.params.provider,
      );

    const authentication =
      await this.authenticateSso.execute({
        provider,
        code,
        state,
      });

    const userAgent =
      request.headers['user-agent'] ?? 'unknown';

    const ipAddress =
      request.ip ?? 'unknown';

    const { accessToken, refreshToken } =
      await this.createSession.execute({
        userId: authentication.userId,
        deviceName: userAgent,
        userAgent,
        ipAddress,
      });

    return {
      authenticated: true,
      accessToken,
      refreshToken,
    };
  }
}
