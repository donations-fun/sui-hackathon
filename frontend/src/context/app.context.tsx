import React, { createContext, ReactNode, useContext, useMemo } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Charity } from "@/hooks/entities/charity.ts";

interface AppContextType {
  suiAddress?: string;
  charities: { [id: string]: Charity };
  allAxelarChains: string[];
}

const AppContext = createContext<AppContextType>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { address: suiAddress } = useCurrentAccount() || {};

  // TODO: Update
  const charities = useMemo(() => {
    return {
      test: {
        id: "test",
        name: "Test",
        chains: ["sui", "eth-sepolia"],
        addressesByChain: { sui: "0x0", "eth-sepolia": "0x0" },
        description: "A test charity",
        url: "https://google.com",
        logo: "https://placehold.co/600x400",
      },
    };
  });
  const allAxelarChains: string[] = useMemo(() => {
    return ["sui", "eth-sepolia"];
  }, []);

  return (
    <AppContext.Provider
      value={{
        suiAddress,
        charities,
        allAxelarChains,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useApp must be used within a AppProvider");
  }

  return context;
}
