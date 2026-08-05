import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticateUser } from '../../application/use-cases/authenticate-user.use-case';

export interface AuthenticateRequest {
  userId: string;
  password: string;
}

@Controller('auth')
export class IdentityController {
  constructor(
    private readonly authenticateUser: AuthenticateUser,
  ) {}

  @Post('login')
  @HttpCode(200)
  async authenticate(
    @Body() request: AuthenticateRequest,
  ): Promise<{ authenticated: boolean }> {
    const authenticated = await this.authenticateUser.execute({
      userId: request.userId,
      password: request.password,
    });

    if (!authenticated) {
      throw new UnauthorizedException({
        authenticated: false,
      });
    }

    return {
      authenticated: true,
    };
  }
}