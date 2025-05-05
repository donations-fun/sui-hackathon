import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { SelectedToken } from "@/hooks/entities/token.ts";
import { ChartNoAxesCombined } from "lucide-react";

export function TokenSelect({
  setSelectedToken,
  availableTokens,
  selectedToken,
}: {
  setSelectedToken: (token: SelectedToken) => void;
  availableTokens: SelectedToken[];
  selectedToken: SelectedToken;
}) {
  return (
    <>
      <Select
        key={selectedToken ? "has-selection" : "no-selection"}
        onValueChange={(value) => setSelectedToken(JSON.parse(value))}
        value={selectedToken ? JSON.stringify(selectedToken) : undefined}
        defaultValue={undefined}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a Token" />
        </SelectTrigger>
        <SelectContent>
          {availableTokens.map((token: SelectedToken) => (
            <SelectItem key={token.id} value={JSON.stringify(token)}>
              <div className="flex">
                {token.logo && (
                  <div className="relative">
                    <img src={token.logo} alt={token.name + " logo"} className="h-5 w-5 mr-2 flex-shrink-0" />
                    {token.analytic && (
                      <ChartNoAxesCombined className="h-1 w-1 absolute right-0 bottom-0 translate-y-1/4 " />
                    )}
                  </div>
                )}
                <span>{token.name}</span>
                <span className="text-sm text-gray-500 ml-3">{token?.balance || "0"}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
