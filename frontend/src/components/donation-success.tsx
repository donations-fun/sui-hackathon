"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChartNoAxesCombined, Check, X } from "lucide-react";
import confetti from "canvas-confetti";
import { Charity } from "@/hooks/entities/charity";
import twitterLogo from "@/assets/images/twitter.png";
import { SelectedToken } from "@/hooks/entities/token";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationAmount: string;
  token: SelectedToken;
  charity: Charity;
}

export function DonationSuccess({ isOpen, onClose, donationAmount, token, charity }: SuccessModalProps) {
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && !hasTriggeredConfetti) {
      triggerFireworks();
      setHasTriggeredConfetti(true);
    }

    if (!isOpen) {
      setHasTriggeredConfetti(false);
    }
  }, [isOpen, hasTriggeredConfetti]);

  const triggerFireworks = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

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
    // TODO: Add X account to charities
    const tweetText = encodeURIComponent(
      `❤️I just donated ${donationAmount} $${token.symbol} to ${charity.name} through @donations_fun!\n\nJoin me in making a difference!\n👉https://donations.fun`,
    );
    window.open(`https://x.com/intent/tweet?text=${tweetText}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <p className="text-center">
            Thank you for your generosity! Your donation will help make a difference.
          </p>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleShareOnTwitter} className="flex items-center gap-2 rounded-lg">
            <img src={twitterLogo} alt="X logo" className="w-6 h-6 cursor-pointer" />
            Share your support on X
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
