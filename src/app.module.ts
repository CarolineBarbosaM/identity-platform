import { Module } from '@nestjs/common';
import { IdentityModule } from './identity/identity.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [IdentityModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
