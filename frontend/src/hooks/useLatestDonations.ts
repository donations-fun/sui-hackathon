import { DefaultError, useQuery } from "@tanstack/react-query";
import { DonationExtended } from "@/hooks/entities/donation.extended.ts";
import { fetchLatestDonations } from "@/api/donations.ts";
import { useEffect, useState } from "react";
import { CoinsMetadata, getCoinsMetadata } from "@/api/general";
import { SUI_AXELAR_CHAIN } from "@/utils/constants";

export const useLatestDonations = (
  chain?: string,
): {
  donations: DonationExtended[];
  isLoading?: boolean;
  error?: any;
  refetch?: () => Promise<any>;
  coinsMetadata: CoinsMetadata;
} => {
  const { data, isLoading, error, refetch } = useQuery<DonationExtended[], DefaultError, DonationExtended[]>({
    queryKey: ["latest-donations", chain],
    queryFn: () => fetchLatestDonations(chain),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
  const [coinsMetadata, setCoinsMetadata] = useState<CoinsMetadata>({});

  useEffect(() => {
    if (!data) {
      return;
    }

    getCoinsMetadata(
      data
        .filter(
          (donation) =>
            donation.chain === SUI_AXELAR_CHAIN || (!donation.onDestChain && donation.sourceChain === SUI_AXELAR_CHAIN),
        )
        .map((donation) => donation.token),
    ).then((result) => setCoinsMetadata(result));
  }, [data]);

  return {
    donations: data,
    isLoading,
    error,
    refetch,
    coinsMetadata,
  };
};
