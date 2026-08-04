import { Module } from '@nestjs/common';
import { IdentityModule } from './identity/identity.module';

@Module({
  imports: [IdentityModule],
  controllers: [],
  providers: [],
})
export class AppModule {}