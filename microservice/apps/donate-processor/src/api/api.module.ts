import { Module } from '@nestjs/common';
import { DatabaseModule } from '@monorepo/common/database/database.module';
import { ApiConfigModule } from '@monorepo/common/config/api.config.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CharitiesController } from './charities.controller';
import { TokensController } from './tokens.controller';

@Module({
  imports: [
    DatabaseModule,
    ApiConfigModule,
    ThrottlerModule.forRoot([
      {
        ttl: 120_000, // 120 seconds
        limit: 5,
      },
    ]),
  ],
  providers: [],
  controllers: [CharitiesController, TokensController],
  exports: [],
})
export class ApiModule {}
