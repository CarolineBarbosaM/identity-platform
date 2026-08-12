import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { AuthenticateUser } from '../../application/use-cases/authenticate-user.use-case';
import { CreateSessionUseCase } from '../../application/use-cases/create-session.use-case';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case';
import { LogoutSessionUseCase } from '../../application/use-cases/logout-session.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';

import { AuthGuard } from './auth.guard';

export interface AuthenticateRequest {
  userId: string;
  password: string;
}

export interface ResetPasswordRequest {
  userId: string;
  token: string;
  newPassword: string;
}

@Controller('auth')
export class IdentityController {
  constructor(
    private readonly authenticateUser: AuthenticateUser,
    private readonly createSession: CreateSessionUseCase,
    private readonly refreshSession: RefreshSessionUseCase,
    private readonly logoutSession: LogoutSessionUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Post('login')
  @HttpCode(200)
  async authenticate(
    @Body() request: AuthenticateRequest,
    @Req()
    httpRequest: {
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
    const authenticated =
      await this.authenticateUser.execute({
        userId: request.userId,
        password: request.password,
      });

    if (!authenticated) {
      throw new UnauthorizedException({
        authenticated: false,
      });
    }

    const userAgent =
      httpRequest.headers['user-agent'] ?? 'unknown';

    const ipAddress =
      httpRequest.ip ?? 'unknown';

    const {
      accessToken,
      refreshToken,
    } = await this.createSession.execute({
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
}
