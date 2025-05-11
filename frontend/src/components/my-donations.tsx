import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Loader2, SquareArrowRight } from "lucide-react";
import { axelarChainsToExplorer, ITEMS_PER_PAGE } from "@/utils/constants.ts";
import { formatAddress, getAxelarExplorerUrl } from "@/utils/helpers.ts";
import { useMyDonations } from "@/hooks/useMyDonations.ts";
import React from "react";
import { useApp } from "@/context/app.context.tsx";
import { ChainsFilter } from "@/components/chains-filter.tsx";
import { useChainsFilter } from "@/hooks/useChainsFilter.tsx";
import DynamicImage from "@/components/dynamic-image.tsx";
import { CoinDisplay } from "@/components/coin-display";
import { Pagination } from "@/components/pagination";

export default function MyDonations() {
  const { charities, knownTokensByAddress } = useApp();

  const { chains, filteredChain, setFilteredChain } = useChainsFilter();
  const { donations, isLoading, coinsMetadata, currentPage, setCurrentPage } = useMyDonations(filteredChain);

  return (
    <Card className="relative py-4 bg-white shadow-lg sm:rounded-3xl lg:p-6">
      <CardHeader>
        <CardTitle className="mb-1">
          My Donations {isLoading && <Loader2 className="inline-flex h-4 w-4 animate-spin" />}
        </CardTitle>

        <div className="flex space-x-1">
          <ChainsFilter chains={chains} filteredChain={filteredChain} setFilteredChain={setFilteredChain} />
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {!isLoading &&
            donations &&
            donations.map((donation, index) => (
              <a
                key={index}
                className="flex flex-col sm:flex-row justify-between items-center"
                href={
                  donation.sourceChain
                    ? getAxelarExplorerUrl(donation.txHash)
                    : axelarChainsToExplorer[donation.chain] + `${donation.txHash}`
                }
                target={"_blank"}
              >
                <span className="text-sm text-gray-600">{formatAddress(donation.user, 16)}</span>
                <span className="text-sm font-medium">
                  <CoinDisplay
                    donation={donation}
                    knownTokensByAddress={knownTokensByAddress}
                    coinsMetadata={coinsMetadata}
                  />
                </span>
                <span className="text-xs text-gray-500">{charities?.[donation.charityId]?.name}</span>
                <span className="flex">
                  {donation.sourceChain && (
                    <>
                      <DynamicImage
                        path={`axelarChains/${donation.sourceChain}.svg`}
                        alt={donation.sourceChain}
                        className="w-4 h-4"
                      />
                      <SquareArrowRight className="w-4 h-4" />
                    </>
                  )}
                  <DynamicImage path={`axelarChains/${donation.chain}.svg`} alt={donation.chain} className="w-4 h-4" />
                </span>
                <span className="text-xs text-gray-500">
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(donation.createdAt))}
                </span>
              </a>
            ))}
        </ul>
      </CardContent>
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          hasMore={donations?.length >= ITEMS_PER_PAGE}
          maxDisplayedPages={3}
        />
      </div>
    </Card>
  );
}
