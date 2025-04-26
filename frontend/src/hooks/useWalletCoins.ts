import { useQuery } from "@tanstack/react-query";
import { SuiApi, TotalCoin } from "@/api/sui.ts";

export const useWalletCoins = (
  suiAddress: string,
): {
  walletCoins: { [coinType: string]: TotalCoin };
  isLoading?: boolean;
  error?: any;
  refetch?: () => Promise<any>;
} => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["wallet-coins", suiAddress],
    queryFn: () => SuiApi.fetchAllCoins(suiAddress),
    refetchOnWindowFocus: false,
  });

  return {
    walletCoins: data,
    isLoading,
    error,
    refetch,
  };
};
