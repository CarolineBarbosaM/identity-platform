import { Module } from '@nestjs/common';
import { IdentityModule } from './identity/identity.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './database/redis.module';

@Module({
  imports: [IdentityModule, DatabaseModule, RedisModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
