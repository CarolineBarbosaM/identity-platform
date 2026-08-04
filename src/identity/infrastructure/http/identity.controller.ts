import { Body, Controller, Post } from '@nestjs/common';
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
  async authenticate(
    @Body() request: AuthenticateRequest,
  ): Promise<boolean> {
    return this.authenticateUser.execute({
      userId: request.userId,
      password: request.password,
    });
  }
}