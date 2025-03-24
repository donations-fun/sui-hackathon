import React from "react";
import { Button } from "@/components/ui/button";
import suiLogo from "@/assets/images/sui_logo.svg";
import { useApp } from "@/context/app.context.tsx";
import { ConnectButton, ConnectModal, useAutoConnectWallet } from "@mysten/dapp-kit";
import { Loader2 } from "lucide-react";
import twitterLogo from "@/assets/images/twitter.png";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';

export default function Login({
  setIsOpenTwitterLinkAccount,
}: {
  setIsOpenTwitterLinkAccount: (isOpen: boolean) => void;
}) {
  const suiAutoConnectionStatus = useAutoConnectWallet();

  const { twitterUsername, suiAddress } = useApp();

  if (suiAddress) {
    return (
      <div className="flex items-center mx-auto sm:mx-0">
        <>
          <img src={suiLogo} alt={"Sui Logo"} className="mr-1 h-4 w-4" /> <span className="mr-2 select-none">Sui</span>
          <ConnectButton />
          <span className="mr-2" />
        </>

        {twitterUsername ? (
          <Popover>
            <PopoverTrigger asChild>
              <img src={twitterLogo} alt="X logo" className="w-6 h-6 cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="px-3 py-2 flex justify-center items-center w-auto flex-col">
              <a href={`https://x.com/${twitterUsername}`} target="_blank" className="text-sm">
                <em>@{twitterUsername}</em>
              </a>
            </PopoverContent>
          </Popover>
        ) : (
          <img
            src={twitterLogo}
            alt="X logo"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setIsOpenTwitterLinkAccount(true)}
          />
        )}
      </div>
    );
  }

  return (
    <ConnectModal
      trigger={
        <Button className={"rounded-3xl"} variant="outline">
          <img src={suiLogo} alt={"Sui Logo"} className="mr-1 h-4 w-4" /> Connect Wallet
          {suiAutoConnectionStatus === "idle" && <Loader2 className="inline-flex h-4 w-4 animate-spin ml-1" />}
        </Button>
      }
    />
  );
}
