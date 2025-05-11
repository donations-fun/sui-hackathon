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

// TODO: Optimise calls to this function
export const getCoinsMetadata = async (coinTypes: string[]): Promise<ExtendedCoinsMetadata> => {
  try {
    const { data } = await api.get(`/general/coins-metadata?coinTypes=${coinTypes.concat(",")}`);
    return data;
  } catch (error) {
    throw error;
  }
};
