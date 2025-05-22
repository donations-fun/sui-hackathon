import React from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { ChartNoAxesCombined, Loader2 } from "lucide-react";
import { ChainsFilter } from "@/components/chains-filter.tsx";
import { useChainsFilter } from "@/hooks/useChainsFilter.tsx";
import { CharitySelect } from "@/components/charity-select.tsx";
import { useDonation } from "@/hooks/donation/useDonation.ts";
import { TokenSelect } from "@/components/token-select.tsx";
import { SUI_AXELAR_CHAIN } from "@/utils/constants.ts";
import LatestDonations from "@/components/latest-donations.tsx";
import Leaderboard from "@/components/leaderboard";
import { Switch } from "@/components/ui/switch";
import { formatBalance } from "@/utils/helpers";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import suiLogo from "@/assets/images/sui_logo.svg";
import axelarLogo from "@/assets/images/axelar_logo.svg";
import flowxLogo from "@/assets/images/flowx_logo.svg";
import { SUI_DECIMALS } from "@mysten/sui/utils";
import { DonationSuccess } from "@/components/donation-success";
import { useApp } from "@/context/app.context";

export default function Donate() {
  const {
    selectedCharityId,
    setSelectedCharityId,
    selectedToken,
    setSelectedToken,
    amount,
    setAmount,
    swapAmount,
    doSwap,
    setDoSwap,
    doSwapIsRequired,
    selectedCharityAxelarNetworks,
    availableTokens,
    doDonate,
    isLoading,
    successModalData,
    setSuccessModalData,
  } = useDonation();

  const { chains, filteredChain, setFilteredChain } = useChainsFilter();

  const { charities } = useApp();

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
              {selectedToken && !selectedToken.analytic && swapAmount && (
                <div className="grid grid-cols-2 items-start gap-4">
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-1">
                      <Switch
                        id="do-swap"
                        label="Do Swap"
                        checked={doSwap}
                        onCheckedChange={setDoSwap}
                        disabled={doSwapIsRequired}
                      />
                      <label htmlFor="do-swap" className="text-sm font-medium leading-none cursor-pointer">
                        Exchange
                      </label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <ChartNoAxesCombined className="h-4 w-4 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="px-3 py-2 flex justify-center items-center w-auto flex-col"
                          >
                            {!doSwapIsRequired ? (
                              <>
                                If you want the token you have selected to count towards your Leaderboard value, <br />
                                it can be swapped to SUI. A 0.2% commission is applied per trade
                              </>
                            ) : (
                              <>
                                This token can only be donated if swapped to Sui. A 0.2% commission is applied per trade
                              </>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <a
                      href="https://flowx.finance/"
                      target="_blank"
                      className="text-muted-foreground flex items-center text-xs "
                    >
                      Swaps by
                      <img src={flowxLogo} alt="Axelar Network" className="h-7 inline-flex -ml-4" />
                    </a>
                  </div>

                  {doSwap && (
                    <div className="col-start-2 relative">
                      <Input
                        type="number"
                        placeholder=""
                        value={formatBalance(swapAmount, SUI_DECIMALS)}
                        disabled={true}
                      />
                      <img
                        src={suiLogo}
                        alt="Sui logo"
                        className="absolute left-0 top-0 translate-y-1/2 -translate-x-6 h-5 w-5"
                      />
                    </div>
                  )}
                </div>
              )}
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

      {selectedToken && selectedCharityId && (
        <DonationSuccess
          successModalData={successModalData}
          onClose={() => {
            setSuccessModalData(null);
            setAmount("");
          }}
          donationAmount={amount}
          token={selectedToken}
          charity={charities[selectedCharityId]}
        />
      )}
    </>
  );
}
