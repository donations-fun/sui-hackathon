import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/context/app.context.tsx";
import { Charity } from "@/hooks/entities/charity.ts";
import { SelectedToken, Token, TokenWithBalance } from "@/hooks/entities/token.ts";
import { SUI_AXELAR_CHAIN, SUI_ITS_TOKEN_ID, SUI_NETWORK, SUI_TOKEN_TYPE } from "@/utils/constants.ts";
import { useWalletCoins } from "@/hooks/useWalletCoins.ts";
import { formatBalance, toDenominatedAmount } from "@/utils/helpers.ts";
import { coinWithBalance, Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { toast } from "react-toastify";
import { ENV } from "@/utils/env.ts";
import { AggregatorQuoter, Coin, SingleQuoteQueryParams, TradeBuilder } from "@flowx-finance/sdk";
import { suiClient } from "@/api/sui";
import { GetRoutesResult } from "@flowx-finance/sdk/src/universal-router/quoters/types";

export const useDonation = () => {
  const { suiAddress, charities, knownTokens } = useApp();

  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenWithBalance | null>(null);
  const [amount, setAmount] = useState("");
  const [swapAmount, setSwapAmount] = useState("");
  const [doSwap, setDoSwap] = useState(false);

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

    const stringifiedToken = JSON.stringify(selectedToken);
    let found = false;
    for (const token of availableTokens) {
      if (token.id === selectedToken.id) {
        if (JSON.stringify(token) !== stringifiedToken) {
          setSelectedToken(token);
          setAmount("");
        }
        found = true;
        break;
      }
    }

    if (!found) {
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

  const fetchQuote: () => Promise<GetRoutesResult<Coin, Coin> | null> = async () => {
    try {
      const quoter = new AggregatorQuoter(SUI_NETWORK);
      const params: SingleQuoteQueryParams = {
        tokenIn: selectedToken.currentChainInfo.tokenAddress,
        tokenOut: SUI_TOKEN_TYPE,
        amountIn: toDenominatedAmount(amount, selectedToken.currentChainInfo.decimals),
        includeSources: null, //optional
        excludeSources: null, //optional
        commission: null, //optional, and will be explain later
        maxHops: null, //optional: default and max is 3
        splitDistributionPercent: null, //optional: default 1 and max 100
        excludePools: null, //optional: list pool you want excude example: 0xpool1,0xpool2
      };

      const routes = await quoter.getRoutes(params);

      if (routes && routes.amountOut.toString() !== "0") {
        setSwapAmount(routes.amountOut.toString());

        return routes;
      } else {
        setSwapAmount("");
      }
    } catch (e) {
      setSwapAmount("");
    } finally {
      fetchQuoteDebounced.current = null;
    }

    return null;
  };

  const fetchQuoteDebounced = useRef(null);
  useEffect(() => {
    if (!selectedToken || !amount || selectedToken.analytic) {
      setSwapAmount("");
      return;
    }

    if (fetchQuoteDebounced.current) {
      clearTimeout(fetchQuoteDebounced.current);
    }

    fetchQuoteDebounced.current = setTimeout(() => fetchQuote(), 250);
  }, [amount, selectedToken]);

  const doDonate = async () => {
    if (!selectedCharity || !selectedToken || !amount) return;

    const tx = new Transaction();
    tx.setSender(suiAddress);

    let coin = coinWithBalance({
      balance: toDenominatedAmount(amount, selectedToken.currentChainInfo.decimals),
      type: selectedToken.currentChainInfo.tokenAddress,
    });
    let donatedTokenType = selectedToken.currentChainInfo.tokenAddress;

    if (doSwap && swapAmount && swapAmount !== "0") {
      coin = await buildSwapTx(tx, coin);
      donatedTokenType = SUI_TOKEN_TYPE;
    }

    if (!(SUI_AXELAR_CHAIN in selectedCharity.addressesByChain)) {
      await doDonateInterchain(tx, coin, donatedTokenType);

      return;
    }

    tx.moveCall({
      target: `${ENV.donateContract}::donate::donate`,
      typeArguments: [donatedTokenType],
      arguments: [tx.object(ENV.donateContractSingletonObject), tx.pure("string", selectedCharity.name), coin],
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

  const buildSwapTx = async (tx: Transaction, coinIn: any) => {
    const routes = await fetchQuote();

    const tradeBuilder = new TradeBuilder(SUI_NETWORK, routes.routes); //routes get from quoter
    const trade = tradeBuilder
      .sender(suiAddress) //Optional if you want pass coin later
      .amountIn(toDenominatedAmount(amount, selectedToken.currentChainInfo.decimals))
      .slippage((0.5 / 100) * 1e6) // Slippage 0.5%
      .commission(null)
      .build();

    // TODO: We remove the SteammPreparer from the arrays since it gives an error on Testnet at least
    // Check if the same on mainnet
    trade.preparer._preparers = trade.preparer._preparers.filter((preparer) => {
      return preparer.constructor.name !== "SteammPreparer";
    });

    return await trade.swap({ client: suiClient, tx, coinIn });
  };

  const doDonateInterchain = async (tx: Transaction, coin: any, donatedTokenType: string) => {
    const [crossChainGasCoin] = tx.splitCoins(tx.gas, [100_000_000]); // 0.1 SUI. TODO: Update this

    const tokenId = tx.moveCall({
      target: `${ENV.tokenIdContract}::token_id::from_address`,
      arguments: [tx.pure.address(donatedTokenType === SUI_TOKEN_TYPE ? SUI_ITS_TOKEN_ID : selectedToken.itsTokenId)],
    });

    tx.moveCall({
      target: `${ENV.donateContract}::donate::donate_interchain`,
      typeArguments: [donatedTokenType],
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
    swapAmount,
    doSwap,
    setDoSwap,
    selectedCharityAxelarNetworks,
    availableTokens,
    doDonate,
    isLoading: isLoading || status === "pending",
  };
};
