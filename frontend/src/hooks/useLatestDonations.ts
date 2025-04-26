import { useQuery } from "@tanstack/react-query";
import { DonationExtended } from "@/hooks/entities/donation.extended.ts";
import { fetchLatestDonations } from "@/api/donations.ts";

export const useLatestDonations = (
  chain?: string,
): {
  donations: DonationExtended[];
  isLoading?: boolean;
  error?: any;
  refetch?: () => Promise<any>;
} => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["latest-donations", chain],
    queryFn: () => fetchLatestDonations(chain),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  return {
    donations: data,
    isLoading,
    error,
    refetch,
  };
};
