import { ENV } from "@/utils/env.ts";

export const SUI_AXELAR_CHAIN = "sui-2"; // TODO: Update when going to mainnet

export const SUI_NETWORK = ENV.suiUrl.includes("testnet") ? "testnet" : "mainnet";

export const axelarChainsToExplorer = {
  [SUI_AXELAR_CHAIN]: SUI_NETWORK === "testnet" ? "https://testnet.suivision.xyz/txblock/" : "https://suivision.xyz/txblock/",

  "eth-sepolia": SUI_NETWORK === "testnet" ? "https://sepolia.etherscan.io/tx/" : "https://etherscan.io/tx/",
  "avalanche-fuji": SUI_NETWORK === "testnet" ? "https://testnet.snowtrace.io/tx/" : "https://snowtrace.io/tx/",
};

export const AXELAR_EXPLORER_URL =
  SUI_NETWORK === "testnet" ? "https://devnet-amplifier.axelarscan.io" : "https://axelarscan.io";

export const SUI_TOKEN_TYPE = '0x2::sui::SUI';
export const SUI_ITS_TOKEN_ID = '0xad04de873f6b5728c0486945fa730703a82454d8a9df7c2c1db89a5246c06d87'; // TODO: Update when going to mainnet
