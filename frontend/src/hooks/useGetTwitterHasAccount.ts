import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTwitterVerification } from "@/api/twitter.ts";
import { useApp } from "@/context/app.context.tsx";

export const useGetTwitterHasAccount = (): {
  hasTwitterAccount?: boolean;
  suiAddress: string | undefined;
  isLoading?: boolean;
  error?: any;
  refetch?: () => Promise<any>;
  setHasTwitterAccount: () => void;
} => {
  const queryClient = useQueryClient();

  const { suiAddress } = useApp();

  const setHasTwitterAccount = () => {
    queryClient.setQueryData(["get-socialfi-has-account", suiAddress], { hasTwitterAccount: true });
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["get-socialfi-has-account", suiAddress],
    queryFn: () => fetchTwitterVerification(suiAddress),
    refetchOnWindowFocus: false,
    enabled: !!suiAddress,
  });

  return {
    hasTwitterAccount: data?.hasTwitterAccount || false,
    suiAddress,
    isLoading,
    error,
    refetch,
    setHasTwitterAccount,
  };
};
