import { useQuery } from "@tanstack/react-query";
import { Token } from "@/hooks/entities/token.ts";
import { fetchTokens } from "@/api/tokens.ts";

export const useTokens = (): {
  tokens: Token[];
  isLoading?: boolean;
  error?: any;
  refetch?: () => Promise<any>;
} => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["all-tokens"],
    queryFn: () => fetchTokens(),
    refetchOnWindowFocus: false,
  });

  return {
    tokens: data || [],
    isLoading,
    error,
    refetch,
  };
};
