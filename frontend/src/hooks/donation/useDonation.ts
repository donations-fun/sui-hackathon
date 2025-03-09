import { useMemo, useState } from "react";
import { useApp } from "@/context/app.context.tsx";
import { Charity } from "@/hooks/entities/charity.ts";
import { SelectedToken, Token } from '@/hooks/entities/token.ts';
import { SUI_AXELAR_CHAIN } from '@/utils/constants.ts';

export const useDonation = () => {
  const { charities, knownTokens } = useApp();

  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<SelectedToken | null>(null);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedCharityAxelarNetworks: string[] = useMemo(() => {
    return Object.keys(charities?.[selectedCharityId]?.addressesByChain || {});
  }, [charities, selectedCharityId]);

  const availableTokens = useMemo<SelectedToken[]>(() => {
    if (!selectedCharityAxelarNetworks.length) {
      return [];
    }

    // For charities from other chains, display only ITS Tokens
    const backendTokens = knownTokens
      .filter(
        (tempToken: Token) =>
          (selectedCharityAxelarNetworks.includes(SUI_AXELAR_CHAIN) ||
            (tempToken.itsTokenId && selectedCharityAxelarNetworks[0] in tempToken.infoByChain)),
      )
      .map((tempToken: Token) => ({
        currentChainInfo: tempToken.infoByChain[SUI_AXELAR_CHAIN],
        ...tempToken,
      }));

    // TODO: Get other tokens from user's wallet
    return backendTokens;
  }, [selectedCharityAxelarNetworks,]);

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
