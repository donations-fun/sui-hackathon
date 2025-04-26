import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/app.context.tsx";
import { Charity } from "@/hooks/entities/charity.ts";
import { SelectedToken, Token, TokenWithBalance } from "@/hooks/entities/token.ts";
import { SUI_AXELAR_CHAIN } from "@/utils/constants.ts";
import { useWalletCoins } from "@/hooks/useWalletCoins.ts";
import { formatBalance } from "@/utils/helpers.ts";
import { coinWithBalance, Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { toast } from "react-toastify";
import { ENV } from '@/utils/env.ts';

export const useDonation = () => {
  const { suiAddress, charities, knownTokens } = useApp();

  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenWithBalance | null>(null);
  const [amount, setAmount] = useState("");

  const { walletCoins, isLoading, refetch } = useWalletCoins(suiAddress);

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
      console.log("Works!");
      setSelectedToken(null);
    }
  }, [availableTokens, selectedToken, selectedCharityAxelarNetworks]);

  const selectedCharity: Charity | null = useMemo(() => {
    return charities?.[selectedCharityId];
  }, [charities, selectedCharityId]);

  const { mutateAsync: signAndExecuteTransaction, status } = useSignAndExecuteTransaction();

  // TODO: Add a confirmation modal with share to X
  // Display confirmation modal after all the transactions are finished
  useEffect(() => {
    if (status === "success") {
      toast.success("Donated successfully!");

      // Fetch coins with a timeout so rpc reflects changes
      setTimeout(() => {
        refetch();
      }, 250);
    } else if (status === "error") {
      toast.error("Failed to donate...");
    }
  }, [status]);

  // TODO: Add ability to swap non-analytic tokens to SUI?
  const doDonate = async () => {
    if (!selectedCharity || !selectedToken || !amount) return;

    if (!(SUI_AXELAR_CHAIN in selectedCharity.addressesByChain)) {
      await doDonateInterchain();

      return;
    }

    const tx = new Transaction();
    tx.setSender(suiAddress);

    const coin = coinWithBalance({
      balance: Math.round(parseFloat(amount) * 10 ** selectedToken.currentChainInfo.decimals),
      type: selectedToken.currentChainInfo.tokenAddress,
    });

    tx.moveCall({
      target: `${ENV.donateContract}::donate::donate`,
      typeArguments: [selectedToken.currentChainInfo.tokenAddress],
      arguments: [
        tx.object(ENV.donateContractSingletonObject),
        tx.pure("string", selectedCharity.name),
        coin,
      ],
    });

    toast.warning("Waiting for donation...", { autoClose: 15000 });

    // Execute the transaction
    try {
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      console.log("Transaction successful:", result);
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  };

  const doDonateInterchain = async () => {
    const tx = new Transaction();
    tx.setSender(suiAddress);

    const coin = coinWithBalance({
      balance: Math.round(parseFloat(amount) * 10 ** selectedToken.currentChainInfo.decimals),
      type: selectedToken.currentChainInfo.tokenAddress,
    });
    const [crossChainGasCoin] = tx.splitCoins(tx.gas, [100_000_000]); // 0.1 SUI. TODO: Update this

    const tokenId = tx.moveCall({
      target: `${ENV.tokenIdContract}::token_id::from_address`,
      arguments: [
        tx.pure.address(selectedToken.itsTokenId),
      ]
    });

    tx.moveCall({
      target: `${ENV.donateContract}::donate::donate_interchain`,
      typeArguments: [selectedToken.currentChainInfo.tokenAddress],
      arguments: [
        tx.object(ENV.donateContractSingletonObject),
        tx.object(ENV.itsObject),
        tx.object(ENV.gatewayObject),
        tx.object(ENV.gasServiceObject),
        tx.pure("string", selectedCharity.name),
        coin,
        tokenId,
        tx.pure("string", Object.keys(selectedCharity.addressesByChain)[0]), // destination chain
        crossChainGasCoin,
        tx.object.clock(),
      ],
    });

    toast.warning("Waiting for donation...", { autoClose: 15000 });

    // Execute the transaction
    try {
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      console.log("Transaction successful:", result);
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
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
    isLoading: isLoading || status === "pending",
  };
};
