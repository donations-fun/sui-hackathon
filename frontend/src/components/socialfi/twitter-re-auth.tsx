import React, { useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { useGetTwitterHasAccount } from "@/hooks/useGetTwitterHasAccount.ts";
import { storageHelper } from "@/utils/storageHelper.ts";
import { fetchReAuth, fetchTwitterUrl } from "@/api/twitter.ts";
import { toast } from "react-toastify";
import { useApp } from "@/context/app.context.tsx";
import { useSignPersonalMessage } from "@mysten/dapp-kit";

export default function TwitterReAuth({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const {
    hasTwitterAccount,
    suiAddress,
    isLoading: isTwitterVerificationLoading,
    setHasTwitterAccount,
    error,
  } = useGetTwitterHasAccount();
  const { setTwitterUsername } = useApp();

  const { mutate: signPersonalMessage } = useSignPersonalMessage();

  const handleTwitterReAuthSuccess = async (address: string, timestamp: number, signature: string) => {
    const response = await fetchReAuth(address, timestamp, signature);
    storageHelper.setJwt(response);
    setHasTwitterAccount();
    setTwitterUsername(response.twitterUsername);

    toast.success("Successfully re-authenticated your account!");
  };

  const handleTwitterReAuthError = (e) => {
    console.error(e);
    toast.warning("Could not re-authenticated your address at this time");
  };

  const reAuth = async () => {
    toast.warning("We need to re-authenticate your address since it is linked to an X account");

    const message = "Sign this message to authenticate on donations.fun";
    const timestamp = Date.now();

    const value = {
      message,
      timestamp,
    };

    await signPersonalMessage(
      {
        message: new TextEncoder().encode(JSON.stringify(value)),
      },
      {
        onSuccess: async (result) => {
          try {
            await handleTwitterReAuthSuccess(address, timestamp, result.signature);
          } catch (e) {
            handleTwitterReAuthError(e);
          }
        },
        onError: handleTwitterReAuthError,
      },
    );
  };

  useEffect(() => {
    if (!suiAddress || isTwitterVerificationLoading || error) {
      return;
    }

    if (hasTwitterAccount) {
      const response = storageHelper.getJwt();

      if (!response || response.address !== suiAddress) {
        reAuth();
      }

      return;
    }

    storageHelper.setJwt(null);
    setTwitterUsername(null);

    if (!storageHelper.isTwitterCancelled()) {
      setTimeout(() => {
        setIsOpen(true);
      }, 1_500);
    }
  }, [suiAddress, isTwitterVerificationLoading, hasTwitterAccount]);

  const handleCancel = () => {
    storageHelper.setTwitterCancelled();

    setIsOpen(false);
  };

  const handleLink = async () => {
    const { url } = await fetchTwitterUrl(suiAddress);

    window.open(url, "_self");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-blue-100">
        <DialogHeader>
          <DialogTitle>Link X account</DialogTitle>
        </DialogHeader>
        <div className="pb-2">
          It appears you have not yet linked any{" "}
          <a href="https://x.com" target="_blank" className="underline decoration-sky-500">
            X account
          </a>{" "}
          to this address. Do you want to link an account now?
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleLink}>Link X Account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
