import { CoinMetadata } from '@mysten/sui/client';

export interface ExtendedCoinMetadata extends CoinMetadata {
  canSwapToSui: boolean;
}
