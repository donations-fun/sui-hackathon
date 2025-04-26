import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { useGetTwitterHasAccount } from "@/hooks/useGetTwitterHasAccount.ts";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchTwitterOauth } from "@/api/twitter.ts";
import { storageHelper } from "@/utils/storageHelper.ts";
import { useApp } from "@/context/app.context.tsx";
import { useSignPersonalMessage } from "@mysten/dapp-kit";

export default function TwitterVerify() {
  const {
    hasTwitterAccount,
    suiAddress,
    isLoading: isTwitterVerificationLoading,
    setHasTwitterAccount,
  } = useGetTwitterHasAccount();
  const { setTwitterUsername } = useApp();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { mutate: signPersonalMessage } = useSignPersonalMessage();

  const handleTwitterLoginSuccess = async (address: string, state: string, code: string, signature: string) => {
    const response = await fetchTwitterOauth(address, state, code, signature);
    storageHelper.setJwt(response);
    setHasTwitterAccount();
    setTwitterUsername(response.twitterUsername);

    toast.success("Successfully linked X account!");

    navigate("/");
  };

  const handleTwitterLoginError = (e) => {
    console.error(e);
    toast.error("An error occurred while trying to link your X account... Please try again");

    navigate("/");
  };

  const handleTwitterLogin = async (state: string, code: string) => {
    const value = {
      state,
      code,
    };

    await signPersonalMessage(
      {
        message: new TextEncoder().encode(JSON.stringify(value)),
      },
      {
        onSuccess: async (result) => {
          try {
            await handleTwitterLoginSuccess(suiAddress, state, code, result.signature);
          } catch (e) {
            handleTwitterLoginError(e);
          }
        },
        onError: handleTwitterLoginError,
      },
    );
  };

  useEffect(() => {
    if (!suiAddress || isTwitterVerificationLoading || hasTwitterAccount) {
      return;
    }

    if (!searchParams.has("state") || !searchParams.has("code")) {
      navigate("/");

      return;
    }

    handleTwitterLogin(searchParams.get("state"), searchParams.get("code"));
  }, [suiAddress, isTwitterVerificationLoading, hasTwitterAccount]);

  return (
    <Dialog open={true}>
      <DialogContent className="bg-blue-100" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Link X account</DialogTitle>
        </DialogHeader>
        <div className="pb-2">
          Sign the message in your wallet in order to confirm your{" "}
          <span className="underline decoration-sky-500">X account</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
