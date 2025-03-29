import { Module } from '@nestjs/common';
import { SuiClient } from '@mysten/sui/client';
import { ApiConfigService } from '@monorepo/common/config/api.config.service';

@Module({
  providers: [
    {
      provide: SuiClient,
      useFactory: (apiConfigService: ApiConfigService) => {
        return new SuiClient({ url: apiConfigService.getSuiClientUrl() });
      },
      inject: [ApiConfigService],
    },
  ],
  exports: [SuiClient],
})
export class ApiModule {}
