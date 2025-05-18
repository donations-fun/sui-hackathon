import { useQuery } from "@tanstack/react-query";
import { DonationExtended } from "@/hooks/entities/donation.extended.ts";
import { fetchMyDonations } from "@/api/donations.ts";
import { storageHelper } from "@/utils/storageHelper.ts";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useApp } from "@/context/app.context.tsx";
import { useNavigate } from "react-router-dom";
import { CoinsMetadata, getCoinsMetadata } from "@/api/general";
import { SUI_AXELAR_CHAIN } from "@/utils/constants";

export const useMyDonations = (
  chain?: string,
): {
  donations: DonationExtended[];
  isLoading?: boolean;
  error?: any;
  refetch?: () => Promise<any>;
  coinsMetadata: CoinsMetadata;
  currentPage: number,
  setCurrentPage: (page: number) => void;
} => {
  const { setTwitterUsername } = useApp();
  const navigate = useNavigate();

  const jwt = storageHelper.getJwt();

  const [currentPage, setCurrentPage] = useState(0);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["my-donations", chain, jwt?.twitterUsername || "", currentPage],
    queryFn: () => fetchMyDonations(chain, jwt?.jwt || "", currentPage),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (error && error instanceof AxiosError && error.status === 401) {
      storageHelper.setJwt(null);
      setTwitterUsername(null);

      navigate("/");
    }
  }, [error]);

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

  useEffect(() => {
    setCurrentPage(0);
  }, [chain]);

  return {
    donations: data,
    isLoading,
    error,
    refetch,
    coinsMetadata,
    currentPage,
    setCurrentPage,
  };
};
