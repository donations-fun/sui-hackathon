import { useQuery } from "@tanstack/react-query";
import { Charity } from "@/hooks/entities/charity.ts";
import { fetchCharities } from "@/api/charities.ts";
import { SUI_AXELAR_CHAIN } from '@/utils/constants.ts';

export const useCharities = (): {
  charities: { [id: string]: Charity };
  isLoading?: boolean;
  error?: any;
  refetch?: () => Promise<any>;
} => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["all-charities"],
    queryFn: () => fetchCharities(),
    refetchOnWindowFocus: false,
  });

  return {
    charities: ((data || []) as Charity[])
      .sort((c1, _) => (SUI_AXELAR_CHAIN in c1.addressesByChain ? -1 : 1))
      .reduce((acc, charity) => {
        acc[charity.id] = charity;

        return acc;
      }, {}),
    isLoading,
    error,
    refetch,
  };
};
