import { useEffect, useMemo, useState } from 'react';
import { useApp } from "@/context/app.context.tsx";
import { Charity } from "@/hooks/entities/charity.ts";
import { SelectedToken, Token, TokenWithBalance } from "@/hooks/entities/token.ts";
import { SUI_AXELAR_CHAIN } from "@/utils/constants.ts";
import { useWalletCoins } from "@/hooks/useWalletCoins.ts";
import { formatBalance } from "@/utils/helpers.ts";

export const useDonation = () => {
  const { suiAddress, charities, knownTokens } = useApp();

  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenWithBalance | null>(null);
  const [amount, setAmount] = useState("");

  const { walletCoins, isLoading } = useWalletCoins(suiAddress);

  const selectedCharityAxelarNetworks: string[] = useMemo(() => {
    return Object.keys(charities?.[selectedCharityId]?.addressesByChain || {});
  }, [charities, selectedCharityId]);

  const availableTokens = useMemo<TokenWithBalance[]>(() => {
    if (!selectedCharityAxelarNetworks.length) {
      return [];
    }

    // For charities from other chains, display only ITS Tokens
    const backendTokens: SelectedToken[] = knownTokens
      .filter(
        (tempToken: Token) =>
          selectedCharityAxelarNetworks.includes(SUI_AXELAR_CHAIN) ||
          (tempToken.itsTokenId && selectedCharityAxelarNetworks[0] in tempToken.infoByChain),
      )
      .map((tempToken: Token) => ({
        currentChainInfo: tempToken.infoByChain[SUI_AXELAR_CHAIN],
        ...tempToken,
      }))
      .filter((tempToken: SelectedToken) => !!tempToken.currentChainInfo);

    const tempWalletCoins = { ...walletCoins };
    const availableTokens: TokenWithBalance[] = [];

    // First add backend tokens, then other tokens
    for (const backendToken of backendTokens) {
      const coinType = backendToken.currentChainInfo.tokenAddress;

      if (!(coinType in tempWalletCoins)) {
        continue;
      }

      availableTokens.push({
        ...backendToken,
        id: coinType,
        balance: formatBalance(tempWalletCoins[coinType].totalBalance, backendToken.currentChainInfo.decimals),
      });

      delete tempWalletCoins[coinType];
    }

    if (!selectedCharityAxelarNetworks.includes(SUI_AXELAR_CHAIN)) {
      return availableTokens;
    }

    // If charity is on Sui, add other tokens as well
    for (const walletToken of Object.values(tempWalletCoins)) {
      const decimals = walletToken.metadata?.decimals || 9;

      availableTokens.push({
        id: walletToken.coinType,
        name: walletToken.metadata?.name || walletToken.coinType.split("::")[2],
        symbol: walletToken.metadata?.symbol,
        infoByChain: {},
        analytic: false,
        logo: walletToken.metadata?.iconUrl,
        currentChainInfo: {
          tokenAddress: walletToken.coinType,
          decimals,
        },
        balance: formatBalance(walletToken.totalBalance, decimals),
      });
    }

    return availableTokens;
  }, [selectedCharityAxelarNetworks, walletCoins, knownTokens]);

  // Reset selected token if available tokens change
  useEffect(() => {
    if (!selectedToken) {
      return;
    }

    let found = false;
    for (const token of availableTokens) {
      if (token.id === selectedToken.id) {
        found = true;
        break;
      }
    }

    if (!found) {
      console.log('Works!');
      setSelectedToken(null);
    }
  }, [availableTokens, selectedToken, selectedCharityAxelarNetworks]);

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
