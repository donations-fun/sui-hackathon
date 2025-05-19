"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink } from "lucide-react";
import confetti from "canvas-confetti";
import { Charity } from "@/hooks/entities/charity";
import twitterLogo from "@/assets/images/twitter.png";
import { SelectedToken } from "@/hooks/entities/token";
import { getAxelarExplorerUrl } from "@/utils/helpers";
import { axelarChainsToExplorer, SUI_AXELAR_CHAIN } from "@/utils/constants";

export interface SuccessModalData {
  digest: string;
  isCrossChain: boolean;
}

interface SuccessModalProps {
  successModalData: SuccessModalData | null;
  onClose: () => void;
  donationAmount: string;
  token: SelectedToken;
  charity: Charity;
}

export function DonationSuccess({ successModalData, onClose, donationAmount, token, charity }: SuccessModalProps) {
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  useEffect(() => {
    if (successModalData && !hasTriggeredConfetti) {
      triggerFireworks();
      setHasTriggeredConfetti(true);
    }

    if (!successModalData) {
      setHasTriggeredConfetti(false);
    }
  }, [successModalData, hasTriggeredConfetti]);

  const triggerFireworks = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Since particles fall down, start a bit higher than random
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        }),
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        }),
      );
    }, 250);
  };

  const handleShareOnTwitter = () => {
    const tweetText = encodeURIComponent(
      `❤️I just donated ${donationAmount} $${token.symbol} to ${charity.twitterUsername ? `@${charity.twitterUsername}` : charity.name} through @donations_fun!\n\nJoin me in making a difference!\n👉https://donations.fun`,
    );
    window.open(`https://x.com/intent/post?text=${tweetText}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={!!successModalData} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-blue-100">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            <span className="text-green-500">Success!</span> 🎉
          </DialogTitle>
          <DialogDescription className="text-black text-center text-lg pt-2 flex flex-wrap justify-center items-center gap-1">
            <span>You just donated</span> <span className="font-bold">{donationAmount} </span>{" "}
            <div className="inline-flex items-center">
              <span className="font-bold">{token.symbol}</span>
              {token.logo && <img src={token.logo} alt={token.name + " logo"} className="h-5 w-5 flex-shrink-0 ml-1" />}
            </div>
            <span>to</span>{" "}
            <a
              href={charity.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold inline-flex items-center gap-1"
            >
              {charity?.logo && (
                <img
                  src={charity.logo || "/placeholder.svg"}
                  alt={`${charity?.name} logo`}
                  className="h-8 w-8 object-contain"
                />
              )}
              <span>{charity.name}</span>
            </a>
            <span>!</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-green-100 p-3 mb-4">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <p className="text-center">Thank you for your generosity! Your donation will help make a difference.</p>
        </div>
        <DialogFooter className="sm:justify-center -mt-1">
          <Button
            onClick={handleShareOnTwitter}
            className="flex items-center gap-2 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:border-2 hover:border-t-0 transition-all duration-200 border-1 border-t-0 border-cyan-400 px-6 py-5"
          >
            <img src={twitterLogo} alt="X logo" className="w-6 h-6 cursor-pointer" />
            Share your support on X
          </Button>
        </DialogFooter>
        <DialogFooter className="sm:justify-center -mt-1">
          <Button
            variant="outline"
            className="flex items-center gap-2 hover:bg-gray-50 border-blue-300 text-cyan-400 hover:text-cyan-500"
            onClick={() =>
              window.open(
                successModalData.isCrossChain
                  ? getAxelarExplorerUrl(successModalData.digest)
                  : axelarChainsToExplorer[SUI_AXELAR_CHAIN] + `${successModalData.digest}`,
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            <ExternalLink className="h-4 w-4" />
            View transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
