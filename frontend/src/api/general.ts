import { api } from "@/api/index";
import { CoinMetadata } from "@mysten/sui/client";

export interface CoinsMetadata {
  [coinType: string]: CoinMetadata;
}

// TODO: Optimise calls to this function
export const getCoinsMetadata = async (coinTypes: string[]): Promise<CoinsMetadata> => {
  try {
    const { data } = await api.get(`/general/coins-metadata?coinTypes=${coinTypes.concat(",")}`);
    return data;
  } catch (error) {
    throw error;
  }
};
