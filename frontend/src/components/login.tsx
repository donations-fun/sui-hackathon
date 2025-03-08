import React from "react";
import { Button } from "@/components/ui/button";
import suiLogo from "@/assets/images/sui_logo.svg";
import { useApp } from "@/context/app.context.tsx";
import { ConnectButton, ConnectModal, useAutoConnectWallet } from "@mysten/dapp-kit";
import { Loader2 } from "lucide-react";

export default function Login() {
  const suiAutoConnectionStatus = useAutoConnectWallet();

  const { suiAddress } = useApp();

  if (suiAddress) {
    return (
      <div className="flex items-center mx-auto sm:mx-0">
        <>
          <img src={suiLogo} alt={"Sui Logo"} className="mr-1 h-4 w-4" /> <span className="mr-2 select-none">Sui</span>
          <ConnectButton />
          <span className="mr-2" />
        </>
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
