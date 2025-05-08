import { Injectable } from '@nestjs/common';
import { InMemoryCacheService } from '@monorepo/common/utils/in-memory-cache';
import { CacheInfo } from '@monorepo/common/utils/cache.info';
import { CoinMetadata, SuiClient } from '@mysten/sui/client';

@Injectable()
export class GeneralService {
  constructor(
    private readonly suiClient: SuiClient,
    private readonly cache: InMemoryCacheService,
  ) {}

  async getCoinsMetadata(coinTypes: string[]) {
    const allMetadata: (CoinMetadata | null)[] = [];

    for (const coinType of coinTypes) {
      let metadata = await this.cache.get<CoinMetadata | null>(CacheInfo.CoinMetadata(coinType).key);

      if (!metadata) {
        try {
          metadata = await this.suiClient.getCoinMetadata({
            coinType,
          });
        } catch (e) {
          console.error(`Error fetching metadata for ${coinType}`, e);
          metadata = null;
        }

        this.cache.set(CacheInfo.CoinMetadata(coinType).key, metadata, CacheInfo.CoinMetadata(coinType).ttl);
      }

      allMetadata.push(metadata);
    }

    return allMetadata.reduce<{ [coinType: string]: CoinMetadata | null }>((acc, metadata, index) => {
      acc[coinTypes[index]] = metadata;

      return acc;
    }, {});
  }
}
