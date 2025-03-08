import { Token } from '@prisma/client';

export type InfoByChain = Record<string, TokenInfo>;

export interface TokenInfo {
  tokenAddress: string;
  decimals: number;
}

export interface TokenExtended extends Token {
  currentChainInfo: TokenInfo;
}
