import React, { useEffect } from "react";
import MyDonations from "@/components/my-donations.tsx";
import { useApp } from "@/context/app.context.tsx";
import { useNavigate } from "react-router-dom";
import { usePrevious } from "@/hooks/usePrevious.tsx";

export function MyAccount() {
  const { suiAddress } = useApp();
  const prevSuiAddress = usePrevious(suiAddress);

  const navigate = useNavigate();

  useEffect(() => {
    if (prevSuiAddress && !suiAddress) {
      navigate("/");
    }
  }, [suiAddress]);

  return (
    <>
      <MyDonations />
    </>
  );
}
