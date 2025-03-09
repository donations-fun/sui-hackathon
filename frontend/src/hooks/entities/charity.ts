export interface Charity {
  id: string;
  name: string;
  addressesByChain: { [chain: string]: string };
  description?: string;
  url?: string;
  logo?: string;
}
