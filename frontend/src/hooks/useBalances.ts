import { SelectedToken } from "@/hooks/entities/token.ts";
import { useApp } from "@/context/app.context.tsx";
import { SuiApi } from "@/api/sui.ts";
import { useEffect, useState } from "react";
import { formatBalance } from "@/utils/helpers.ts";

export const useBalances = (tokens: SelectedToken[]) => {
  const { suiAddress } = useApp();

  const [balances, setBalances] = useState();

  useEffect(() => {
    const fetchAllCoins = async () => {
      const allCoins = await SuiApi.fetchAllCoins(suiAddress);

      const newBalances = tokens.map((token) => {
        return formatBalance(
          allCoins?.[token.currentChainInfo?.tokenAddress] || 0n,
          token.currentChainInfo?.decimals || 18,
        );
      });

      setBalances(newBalances);
    };

    if (suiAddress) {
      fetchAllCoins();
    }
  }, [suiAddress, tokens]);

  return balances;
};
