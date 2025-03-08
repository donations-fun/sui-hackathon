import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { SelectedToken } from "@/hooks/entities/token.ts";

export function TokenSelect({ setSelectedToken, availableTokens, selectedToken, balances }) {
  return (
    <>
      <Select onValueChange={(value) => setSelectedToken(JSON.parse(value))} value={JSON.stringify(selectedToken)}>
        <SelectTrigger>
          <SelectValue placeholder="Select Token" />
        </SelectTrigger>
        <SelectContent>
          {availableTokens.map((token: SelectedToken, index) => (
            <SelectItem key={token.id} value={JSON.stringify(token)}>
              <div className="flex">
                {token.logo && (
                  <img src={token.logo} alt={token.name.name + " logo"} className="h-5 w-5 mr-1 flex-shrink-0" />
                )}
                <span>{token.name}</span>
                <span className="text-sm text-gray-500 ml-3">{balances?.[index] || "0"}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
