import React from "react";
import { Badge } from "@/components/ui/badge.tsx";

export function ChainsFilter({ chains, filteredChain, setFilteredChain }) {
  return chains.map((chain) => (
    <Badge
      key={chain.axelarChain}
      className={`cursor-pointer transition-colors duration-200 ${
        filteredChain === chain.axelarChain ? "ring-2 ring-offset-2 ring-blue-500" : ""
      }`}
      onClick={() => setFilteredChain(chain.axelarChain)}
      variant="outline"
    >
      {chain.img}
    </Badge>
  ));
}
