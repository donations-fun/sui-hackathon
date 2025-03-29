import { ENV } from "@/utils/env.ts";

export const SUI_AXELAR_CHAIN = "sui-2"; // TODO: Update when going to mainnet

export const SUI_NETWORK = ENV.suiUrl.includes("testnet") ? "testnet" : "mainnet";

export const axelarChainsToExplorer = {
  [SUI_AXELAR_CHAIN]: SUI_NETWORK === "testnet" ? "https://testnet.suivision.xyz/txblock/" : "https://suivision.xyz/txblock/",

  "eth-sepolia": SUI_NETWORK === "testnet" ? "https://sepolia.etherscan.io/tx/" : "https://etherscan.io/tx/",
};

export const AXELAR_EXPLORER_URL =
  SUI_NETWORK === "testnet" ? "https://devnet-amplifier.axelarscan.io" : "https://axelarscan.io";
