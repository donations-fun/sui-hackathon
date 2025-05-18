import { Module } from '@nestjs/common';
import { SuiClient } from '@mysten/sui/client';
import { ApiConfigService } from '@monorepo/common/config/api.config.service';
import { InMemoryCacheService } from '@monorepo/common/utils/in-memory-cache';
import { AggregatorQuoter, CoinProvider } from '@flowx-finance/sdk';

@Module({
  providers: [
    {
      provide: SuiClient,
      useFactory: (apiConfigService: ApiConfigService) => {
        return new SuiClient({ url: apiConfigService.getSuiClientUrl() });
      },
      inject: [ApiConfigService],
    },
    {
      provide: CoinProvider,
      useValue: new CoinProvider('mainnet'), // Always use prices from mainnet, devnet prices are mocked
    },
    {
      provide: AggregatorQuoter,
      useFactory: (apiConfigService: ApiConfigService) => {
        return new AggregatorQuoter(apiConfigService.getSuiNetwork());
      },
      inject: [ApiConfigService],
    },
    InMemoryCacheService,
  ],
  exports: [SuiClient, InMemoryCacheService, CoinProvider, AggregatorQuoter],
})
export class ApiModule {}
