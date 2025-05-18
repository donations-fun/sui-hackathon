import { CoinMetadata, SuiClient } from '@mysten/sui/client';
import { ENV } from '@/utils/env.ts';
import { ExtendedCoinMetadata, getCoinsMetadata } from '@/api/general';

export const suiClient = new SuiClient({
  url: ENV.suiUrl,
});

export interface Coin {
  balance: string;
  coinObjectId: string;
  coinType: string;
  digest: string;
  previousTransaction: string;
  version: string;
}

export interface TotalCoin {
  totalBalance: bigint;
  coinType: string;
  coinObjects: Coin[];
  metadata?: ExtendedCoinMetadata;
}

export const SuiApi = {
  async fetchAllCoins(address: string): Promise<{ [coinType: string]: TotalCoin }> {
    if (!address) {
      return {};
    }

    let allCoins: Coin[] = [];
    let cursor: string = undefined;

    try {
      while (true) {
        // Get all coin objects owned by the address
        const {
          data: coins,
          hasNextPage,
          nextCursor,
        } = await suiClient.getAllCoins({
          owner: address,
          cursor,
        });

        allCoins.push(...coins);

        if (hasNextPage && nextCursor) {
          cursor = nextCursor;
        } else {
          break;
        }
      }

      // Sum up the balances
      const result = allCoins.reduce<{ [coinType: string]: Omit<TotalCoin, "metadata"> }>((acc, coin) => {
        if (!(coin.coinType in acc)) {
          acc[coin.coinType] = {
            totalBalance: 0n,
            coinType: coin.coinType,
            coinObjects: [],
          };
        }

        acc[coin.coinType].totalBalance += BigInt(coin.balance);
        acc[coin.coinType].coinObjects.push(coin);

        return acc;
      }, {});

      const coinTypes = Object.keys(result);

      const allCoinsMetadata = await getCoinsMetadata(coinTypes);

      return coinTypes
        .map<TotalCoin>((coinType) => {
          return {
            ...result[coinType],
            metadata: allCoinsMetadata[coinType],
          };
        })
        .reduce((acc, item) => {
          if (item.totalBalance > 0) {
            acc[item.coinType] = item;
          }

          return acc;
        }, {});
    } catch (e) {
      console.error(e);

      return {};
    }
  },
};
