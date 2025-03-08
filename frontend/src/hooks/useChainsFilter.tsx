import { React, ReactNode, useMemo, useState } from "react";
import { Library } from "lucide-react";
import { useApp } from "@/context/app.context.tsx";
import DynamicImage from "@/components/dynamic-image.tsx";

export const useChainsFilter = () => {
  const { allAxelarChains } = useApp();

  const [filteredChain, setFilteredChain] = useState<any>(null);

  const chains = useMemo(() => {
    const newChains: { axelarChain: string; img: ReactNode }[] = [
      {
        axelarChain: null,
        img: (
          <>
            <Library className="h-4 w-4 mr-1" /> All{" "}
          </>
        ),
      },
      ...allAxelarChains.map((axelarChain) => ({
        axelarChain,
        img: <DynamicImage path={`axelarChainsFull/${axelarChain}.svg`} alt={axelarChain} className="w-16 h-4" />,
      })),
    ];

    return newChains;
  }, [allAxelarChains]);

  return {
    chains,
    filteredChain,
    setFilteredChain,
  };
};
