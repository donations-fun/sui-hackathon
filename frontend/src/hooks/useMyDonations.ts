import { useQuery } from "@tanstack/react-query";
import { DonationExtended } from "@/hooks/entities/donation.extended.ts";
import { fetchMyDonations } from "@/api/donations.ts";
import { storageHelper } from "@/utils/storageHelper.ts";
import { useEffect } from "react";
import { AxiosError } from "axios";
import { useApp } from "@/context/app.context.tsx";
import { useNavigate } from "react-router-dom";

export const useMyDonations = (
  chain?: string,
): {
  donations: DonationExtended[];
  isLoading?: boolean;
  error?: any;
  refetch?: () => Promise<any>;
} => {
  const { setTwitterUsername } = useApp();
  const navigate = useNavigate();

  const jwt = storageHelper.getJwt();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["my-donations", chain, jwt?.twitterUsername || ""],
    queryFn: () => fetchMyDonations(chain, jwt?.jwt || ""),
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

  return {
    donations: data,
    isLoading,
    error,
    refetch,
  };
};
