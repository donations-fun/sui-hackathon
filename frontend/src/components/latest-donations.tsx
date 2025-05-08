import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { useLatestDonations } from "@/hooks/useLatestDonations.ts";
import { Loader2, SquareArrowUpRight } from "lucide-react";
import { axelarChainsToExplorer } from "@/utils/constants.ts";
import { formatAddress, getAxelarExplorerUrl } from "@/utils/helpers.ts";
import React from "react";
import { useApp } from "@/context/app.context.tsx";
import { ChainsFilter } from "@/components/chains-filter.tsx";
import { useChainsFilter } from "@/hooks/useChainsFilter.tsx";
import DynamicImage from "@/components/dynamic-image.tsx";
import { CoinDisplay } from "@/components/coin-display";

export default function LatestDonations() {
  const { chains, filteredChain, setFilteredChain } = useChainsFilter();

  const { donations, isLoading, coinsMetadata } = useLatestDonations(filteredChain);
  const { charities, knownTokensByAddress } = useApp();

  return (
    <Card className="mt-6 sm:mt-14 py-4 bg-white shadow-lg sm:rounded-3xl lg:p-6">
      <CardHeader>
        <CardTitle className="mb-1">
          Latest Donations {isLoading && <Loader2 className="inline-flex h-4 w-4 animate-spin" />}
        </CardTitle>

        <div className="flex space-x-1">
          <ChainsFilter chains={chains} filteredChain={filteredChain} setFilteredChain={setFilteredChain} />
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {!isLoading &&
            donations.map((donation, index) => (
              <a
                key={index}
                className="flex justify-between items-center"
                href={
                  donation.sourceChain
                    ? getAxelarExplorerUrl(donation.txHash)
                    : axelarChainsToExplorer[donation.chain] + `${donation.txHash}`
                }
                target={"_blank"}
              >
                <span className="text-sm text-gray-600">
                  <em>{donation.user.startsWith("0x") ? formatAddress(donation.user) : "@" + donation.user}</em>
                </span>
                <span className="text-sm font-medium">
                  <CoinDisplay
                    donation={donation}
                    knownTokensByAddress={knownTokensByAddress}
                    coinsMetadata={coinsMetadata}
                  />
                </span>
                <span className="text-xs text-gray-500">{charities?.[donation.charityId]?.name}</span>
                <span className="flex">
                  <DynamicImage path={`axelarChains/${donation.chain}.svg`} alt={donation.chain} className="w-4 h-4" />
                  {donation.sourceChain && <SquareArrowUpRight className="w-3 h-3" />}
                </span>
              </a>
            ))}
        </ul>
      </CardContent>
    </Card>
  );
}
