export interface TypeName {
  name: string; // does NOT have 0x prefix
}

export interface TokenId {
  id: string; // has 0x prefix
}

export interface AddKnownCharity {
  charity_id: string;
  charity_name: string;
  charity_address: string;
}

export interface RemoveKnownCharity {
  charity_id: string;
  charity_name: string;
  charity_address: string;
}

export interface AddKnownCharityInterchain {
  charity_id: string;
  charity_name: string;
  destination_chain: string;
  charity_address: number[];
}

export interface RemoveKnownCharityInterchain {
  charity_id: string;
  charity_name: string;
  destination_chain: string;
  charity_address: number[];
}

export interface AddAnalyticToken {
  token: TypeName;
}

export interface RemoveAnalyticToken {
  token: TypeName;
}

export interface DonationEvent {
  user: string;
  token: TypeName;
  charity_id: string;
  charity_name: string;
  amount: string;
}

export interface DonationInterchainEvent {
  user: string;
  token: TypeName;
  charity_id: string;
  charity_name: string;
  amount: string;
  token_id: TokenId;
  destination_chain: string;
}
