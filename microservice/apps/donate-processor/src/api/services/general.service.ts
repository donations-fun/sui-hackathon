import { Injectable } from '@nestjs/common';
import { InMemoryCacheService } from '@monorepo/common/utils/in-memory-cache';
import { CacheInfo } from '@monorepo/common/utils/cache.info';
import { CoinMetadata, SuiClient } from '@mysten/sui/client';
import { ExtendedCoinMetadata } from '../entities/extended.coin.metadata';
import { AggregatorQuoter, Coin, GetRoutesResult, SingleQuoteQueryParams } from '@flowx-finance/sdk';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';

@Injectable()
export class GeneralService {
  constructor(
    private readonly suiClient: SuiClient,
    private readonly cache: InMemoryCacheService,
    private readonly aggregatorQuoter: AggregatorQuoter,
  ) {}

  async getCoinsMetadata(coinTypes: string[]) {
    const allMetadata: (ExtendedCoinMetadata | null)[] = [];

    for (const coinType of coinTypes) {
      let extendedMetadata = await this.cache.get<ExtendedCoinMetadata | null>(CacheInfo.CoinMetadata(coinType).key);

      if (!extendedMetadata) {
        try {
          const coinMetadata = await this.suiClient.getCoinMetadata({
            coinType,
          });

          if (!coinMetadata) {
            extendedMetadata = null;
          } else {
            const canSwapToSui = await this.canSwapToSui(coinType, coinMetadata);

            extendedMetadata = {
              ...coinMetadata,
              canSwapToSui,
            };
          }
        } catch (e) {
          console.error(`Error fetching metadata for ${coinType}`, e);
          extendedMetadata = null;
        }

        this.cache.set(CacheInfo.CoinMetadata(coinType).key, extendedMetadata, CacheInfo.CoinMetadata(coinType).ttl);
      }

      allMetadata.push(extendedMetadata);
    }

    return allMetadata.reduce<{ [coinType: string]: ExtendedCoinMetadata | null }>((acc, metadata, index) => {
      acc[coinTypes[index]] = metadata;

      return acc;
    }, {});
  }

  private async canSwapToSui(coinType: string, coinMetadata: CoinMetadata) {
    try {
      const params: SingleQuoteQueryParams = {
        tokenIn: coinType,
        tokenOut: SUI_TYPE_ARG,
        amountIn: String(10 ** coinMetadata.decimals),
      };

      const routes = await this.aggregatorQuoter.getRoutes(params);

      if (routes && routes.amountOut.toString() !== '0') {
        return true;
      }
    } catch (e) {
      console.warn(`Token ${coinType} can not be swapped to Sui`);
    }

    return false;
  }
}
