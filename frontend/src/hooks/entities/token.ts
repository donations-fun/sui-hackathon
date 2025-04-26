export interface Token {
  id: number;
  name: string;
  symbol: string;
  infoByChain: {
    [chain: string]: ChainInfo;
  };
  itsTokenId?: string;
  analytic: boolean;
  logo?: string;
}

export interface SelectedToken extends Omit<Token, "id"> {
  id: string;
  currentChainInfo: ChainInfo;
}

export interface TokenWithBalance extends SelectedToken {
  balance: string;
}

interface ChainInfo {
  tokenAddress: string;
  decimals: number;
}
