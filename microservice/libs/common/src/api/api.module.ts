import { Module } from '@nestjs/common';
import { SuiClient } from '@mysten/sui/client';
import { ApiConfigService } from '@monorepo/common/config/api.config.service';
import { InMemoryCacheService } from "@monorepo/common/utils/in-memory-cache";
import { CoinProvider } from '@flowx-finance/sdk';

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
      useValue: new CoinProvider("mainnet"),
    },
    InMemoryCacheService,
  ],
  exports: [SuiClient, InMemoryCacheService, CoinProvider],
})
export class ApiModule {}
