import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticateUser } from '../../application/use-cases/authenticate-user.use-case';
import { CreateSessionUseCase } from '../../application/use-cases/create-session.use-case';

export interface AuthenticateRequest {
  userId: string;
  password: string;
}

@Controller('auth')
export class IdentityController {
  constructor(
    private readonly authenticateUser: AuthenticateUser,
    private readonly createSession: CreateSessionUseCase,
  ) {}

  @Post('login')
  @HttpCode(200)
  async authenticate(
    @Body() request: AuthenticateRequest,
  ): Promise<{
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

    const { accessToken, refreshToken } =
      await this.createSession.execute({
        userId: request.userId,
    });

    return {
      authenticated: true,
      accessToken,
      refreshToken,
    };
  }
}