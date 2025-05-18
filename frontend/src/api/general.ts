import { api } from "@/api/index";
import { CoinMetadata } from "@mysten/sui/client";

export interface CoinsMetadata {
  [coinType: string]: CoinMetadata;
}

export interface ExtendedCoinMetadata extends CoinMetadata {
  canSwapToSui: boolean;
}

export interface ExtendedCoinsMetadata {
  [coinType: string]: ExtendedCoinMetadata;
}

let coinsMetadataCache: ExtendedCoinsMetadata = {};

export const getCoinsMetadata = async (coinTypes: string[]): Promise<ExtendedCoinsMetadata> => {
  const newCoinTypes = coinTypes.filter((coinType) => !(coinType in coinsMetadataCache));

  // Save coins metadata to local cache and only fetch data for new coins
  if (newCoinTypes.length > 0) {
    try {
      const { data } = await api.get<ExtendedCoinsMetadata>(
        `/general/coins-metadata?coinTypes=${newCoinTypes.concat(",")}`,
      );

      coinsMetadataCache = {
        ...coinsMetadataCache,
        ...data,
      };
    } catch (error) {
      throw error;
    }
  }

  return coinsMetadataCache;
};
