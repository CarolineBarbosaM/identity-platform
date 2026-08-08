import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { AuthenticateUser } from '../../application/use-cases/authenticate-user.use-case';
import { CreateSessionUseCase } from '../../application/use-cases/create-session.use-case';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case';
import { LogoutSessionUseCase } from '../../application/use-cases/logout-session.use-case';
import { AuthGuard } from './auth.guard';

export interface AuthenticateRequest {
  userId: string;
  password: string;
}

@Controller('auth')
export class IdentityController {
  constructor(
    private readonly authenticateUser: AuthenticateUser,
    private readonly createSession: CreateSessionUseCase,
    private readonly refreshSession: RefreshSessionUseCase,
    private readonly logoutSession: LogoutSessionUseCase,
  ) {}

  @Post('login')
  @HttpCode(200)
  async authenticate(@Body() request: AuthenticateRequest): Promise<{
    authenticated: boolean;
    accessToken: string;
    refreshToken: string;
  }> {
    const authenticated = await this.authenticateUser.execute({
      userId: request.userId,
      password: request.password,
    });

    if (!authenticated) {
      throw new UnauthorizedException({
        authenticated: false,
      });
    }

    const { accessToken, refreshToken } = await this.createSession.execute({
      userId: request.userId,
    });

    return {
      authenticated: true,
      accessToken,
      refreshToken,
    };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() request: { refreshToken: string }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    return this.refreshSession.execute({
      refreshToken: request.refreshToken,
    });
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Body() request: { sessionId: string }): Promise<void> {
    await this.logoutSession.execute({
      sessionId: request.sessionId,
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
}
