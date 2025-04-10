import { Module } from '@nestjs/common';
import { SuiClient } from '@mysten/sui/client';
import { ApiConfigService } from '@monorepo/common/config/api.config.service';
import { InMemoryCacheService } from "@monorepo/common/utils/in-memory-cache";

@Module({
  providers: [
    {
      provide: SuiClient,
      useFactory: (apiConfigService: ApiConfigService) => {
        return new SuiClient({ url: apiConfigService.getSuiClientUrl() });
      },
      inject: [ApiConfigService],
    },
    InMemoryCacheService,
  ],
  exports: [SuiClient, InMemoryCacheService],
})
export class ApiModule {}
