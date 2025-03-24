import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Charity } from "@/hooks/entities/charity.ts";
import { useCharities } from '@/hooks/useCharities.ts';
import { useTokens } from '@/hooks/useTokens.ts';
import { Token } from '@/hooks/entities/token.ts';
import { storageHelper } from '@/utils/storageHelper.ts';

interface AppContextType {
  suiAddress?: string;
  twitterUsername: string | null;
  setTwitterUsername: (twitterUsername: string) => void;
  charities: { [id: string]: Charity };
  knownTokens: Token[];
  allAxelarChains: string[];
}

const AppContext = createContext<AppContextType>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { address: suiAddress } = useCurrentAccount() || {};

  const { charities } = useCharities();
  const { tokens: knownTokens } = useTokens();

  const allAxelarChains = useMemo(() => {
    const axelarChains = new Set<string>();
    axelarChains.add('sui-2');

    for (const charity of Object.values(charities)) {
      for (const chain of Object.keys(charity.addressesByChain)) {
        axelarChains.add(chain);
      }
    }

    return [...axelarChains];
  }, [charities]);

  const [twitterUsername, setTwitterUsername] = useState<string>(storageHelper.getJwt()?.twitterUsername || null);

  return (
    <AppContext.Provider
      value={{
        suiAddress,
        twitterUsername,
        setTwitterUsername,
        charities,
        knownTokens,
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
