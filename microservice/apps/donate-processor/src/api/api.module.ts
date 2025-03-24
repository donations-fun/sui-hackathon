import { Module } from '@nestjs/common';
import { DatabaseModule } from '@monorepo/common/database/database.module';
import { ApiConfigModule } from '@monorepo/common/config/api.config.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CharitiesController } from './charities.controller';
import { TokensController } from './tokens.controller';
import { TwitterController } from './twitter.controller';
import { TwitterService } from './services/twitter.service';
import { InMemoryCacheService } from '@monorepo/common/utils/in-memory-cache';
import { ApiConfigService } from '@monorepo/common/config/api.config.service';
import { JwtModule } from '@nestjs/jwt';

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
    JwtModule.registerAsync({
      useFactory: (apiConfigService: ApiConfigService) => {
        return {
          publicKey: apiConfigService.getJwtPublicKey(),
          privateKey: apiConfigService.getJwtPrivateKey(),
          signOptions: {
            expiresIn: '60d',
            algorithm: 'RS256',
          },
        };
      },
      imports: [ApiConfigModule],
      inject: [ApiConfigService],
    }),
  ],
  providers: [InMemoryCacheService, TwitterService],
  controllers: [CharitiesController, TokensController, TwitterController],
  exports: [],
})
export class ApiModule {}
