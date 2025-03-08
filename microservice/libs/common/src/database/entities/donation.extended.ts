export interface DonationExtended {
  chain: string;
  user: string;
  token: string;
  charityId: string;
  amount: string;
  sourceChain: string;
  txHash: string;
  createdAt: string;
  onDestChain: boolean;
}

export interface DonationExtendedWithId extends DonationExtended {
  id: number;
}
