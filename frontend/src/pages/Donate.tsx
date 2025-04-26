import React from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2 } from "lucide-react";
import { ChainsFilter } from "@/components/chains-filter.tsx";
import { useChainsFilter } from "@/hooks/useChainsFilter.tsx";
import { CharitySelect } from "@/components/charity-select.tsx";
import { useDonation } from "@/hooks/donation/useDonation.ts";
import { TokenSelect } from "@/components/token-select.tsx";

import axelarLogo from "@/assets/images/axelar_logo.svg";
import { SUI_AXELAR_CHAIN } from "@/utils/constants.ts";
import LatestDonations from '@/components/latest-donations.tsx';
import Leaderboard from "@/components/leaderboard";

export default function Donate() {
  const {
    selectedCharityId,
    setSelectedCharityId,
    selectedToken,
    setSelectedToken,
    amount,
    setAmount,
    selectedCharityAxelarNetworks,
    availableTokens,
    doDonate,
    isLoading,
  } = useDonation();

  const { chains, filteredChain, setFilteredChain } = useChainsFilter();

  return (
    <>
      <div className="relative flex flex-col lg:flex-row gap-4">
        <div className="lg:w-2/3">
          {/* Gradient background */}
          <div className="absolute inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>

          {/* Card content */}
          <Card className="relative py-4 bg-white shadow-lg sm:rounded-3xl lg:p-6">
            <CardHeader>
              <CardTitle>
                Donations just for <em>FUN</em>
              </CardTitle>
              <CardDescription>
                Show support towards your favorite charity and get ranked on the leaderboard!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0 sm:p-6">
              <div className="flex space-x-1">
                <ChainsFilter chains={chains} filteredChain={filteredChain} setFilteredChain={setFilteredChain} />
              </div>
              <div className="grid gap-4 mb-4">
                <CharitySelect
                  selectedCharity={selectedCharityId}
                  setSelectedCharity={setSelectedCharityId}
                  filteredChain={filteredChain}
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <TokenSelect
                  selectedToken={selectedToken}
                  setSelectedToken={setSelectedToken}
                  availableTokens={availableTokens}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="col-start-2"
                  min="0"
                  max={selectedToken?.balance}
                  step="0.000001"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className={"mx-auto"}
                variant="default"
                onClick={doDonate}
                disabled={
                  !selectedCharityId ||
                  !selectedToken ||
                  !amount ||
                  isLoading ||
                  Number(amount) > Number(selectedToken?.balance)
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="ml-2">Donating...</span>
                  </>
                ) : (
                  <>
                    Donate
                    {selectedCharityAxelarNetworks.length > 0 &&
                      !selectedCharityAxelarNetworks.includes(SUI_AXELAR_CHAIN) &&
                      " (Cross Chain)"}
                  </>
                )}
              </Button>
            </CardFooter>
            <CardFooter className="py-0">
              <CardDescription>
                <a href="https://www.axelar.network/" target="_blank" className="flex items-end text-xs">
                  Powered by
                  <img src={axelarLogo} alt="Axelar Network" className="h-4 inline-flex ml-1" />
                </a>
              </CardDescription>
            </CardFooter>
          </Card>
        </div>
        <div className="lg:w-1/3">
          <Leaderboard />
        </div>
      </div>

      <div className="lg:w-3/4 mx-auto">
        <LatestDonations />
      </div>
    </>
  );
}
