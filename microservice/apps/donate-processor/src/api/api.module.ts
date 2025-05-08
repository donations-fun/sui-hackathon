import { Module } from '@nestjs/common';
import { DatabaseModule } from '@monorepo/common/database/database.module';
import { ApiConfigModule } from '@monorepo/common/config/api.config.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CharitiesController } from './charities.controller';
import { TokensController } from './tokens.controller';
import { TwitterController } from './twitter.controller';
import { TwitterService } from './services/twitter.service';
import { ApiConfigService } from '@monorepo/common/config/api.config.service';
import { JwtModule } from '@nestjs/jwt';
import { DonationsController } from './donations.controller';
import { ApiModule as CommonApiModule } from '@monorepo/common/api/api.module';
import { LeaderboardController } from './leaderboard.controller';
import { GeneralService } from './services/general.service';
import { GeneralController } from './general.controller';

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
    CommonApiModule,
  ],
  providers: [TwitterService, GeneralService],
  controllers: [
    CharitiesController,
    TokensController,
    TwitterController,
    DonationsController,
    LeaderboardController,
    GeneralController,
  ],
  exports: [],
})
export class ApiModule {}
