import { useMemo, useState } from "react";
import { useApp } from "@/context/app.context.tsx";
import { Charity } from "@/hooks/entities/charity.ts";
import { SelectedToken } from "@/hooks/entities/token.ts";

export const useDonation = () => {
  const { charities } = useApp();

  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<SelectedToken | null>(null);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedCharityAxelarNetworks: string[] = useMemo(() => {
    return Object.keys(charities?.[selectedCharityId]?.addressesByChain || {});
  }, [charities, selectedCharityId]);

  // TODO:
  const availableTokens = useMemo<SelectedToken[]>(() => {
    return [
      {
        id: 0,
        name: "Sui",
        symbol: "SUI",
        infoByChain: {
          sui: {
            tokenAddress: "0x2::sui::SUI",
            decimals: 9,
          },
          "eth-sepolia": {
            tokenAddress: "0x0",
            decimals: 9,
          },
        },
        itsTokenId: "0x0",
        analytic: true,
        logo: "https://cryptologos.cc/logos/sui-sui-logo.svg",
        currentChainInfo: { tokenAddress: "0x2::sui::SUI", decimals: 9 },
      },
    ];
  }, []);

  const selectedCharity: Charity | null = useMemo(() => {
    return charities?.[selectedCharityId];
  }, [charities, selectedCharityId]);

  const doDonate = async () => {
    if (!selectedCharity || !selectedToken || !amount) return;

    console.log("TODO");
  };

  return {
    selectedCharityId,
    setSelectedCharityId,
    selectedToken,
    setSelectedToken,
    amount,
    setAmount,
    selectedCharityAxelarNetworks,
    availableTokens,
    doDonate,
    isLoading,
  };
};
