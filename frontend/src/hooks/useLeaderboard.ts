import { useQuery } from "@tanstack/react-query";
import { Leaderboard } from "@/hooks/entities/leaderboard";
import { fetchLeaderboard } from "@/api/leaderboard";

export const useLeaderboard = (
  chain?: string,
): {
  leaderboard: Leaderboard[];
  isLoading?: boolean;
  error?: any;
  refetch?: () => Promise<any>;
} => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["leaderboard", chain],
    queryFn: () => fetchLeaderboard(chain),
    refetchOnWindowFocus: false,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  return {
    leaderboard: data,
    isLoading,
    error,
    refetch,
  };
};
