import React, { useEffect, useMemo } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button.tsx";
import { useApp } from "@/context/app.context.tsx";
import DynamicImage from "@/components/dynamic-image.tsx";

export function CharitySelect({ selectedCharity, setSelectedCharity, filteredChain }) {
  const { charities } = useApp();

  const filteredCharities = useMemo(() => {
    return Object.values(charities).filter((charity) => !filteredChain || filteredChain in charity.addressesByChain);
  }, [charities, filteredChain]);
  const fullSelectedCharity = charities[selectedCharity];

  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (!filteredChain) {
      return;
    }

    if (!(filteredChain in (fullSelectedCharity?.addressesByChain || {}))) {
      setSelectedCharity(Object.values(filteredCharities)?.[0]?.id || null);
    }
  }, [filteredChain, fullSelectedCharity]);

  return (
    <div className="flex items-center space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <InfoIcon className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h3 className="font-semibold underline cursor-pointer">
              <a href={fullSelectedCharity?.url} target="_blank" rel="noopener noreferrer">
                {fullSelectedCharity?.name || "Charity Information"}
              </a>
            </h3>
            <p className="text-sm text-gray-500" style={{ whiteSpace: "pre-wrap" }}>
              {fullSelectedCharity?.description ||
                (!fullSelectedCharity && "Select a charity to see more information.")}
            </p>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedCharity ? (
              <div className="flex">
                {fullSelectedCharity?.logo && (
                  <img
                    src={fullSelectedCharity.logo}
                    alt={fullSelectedCharity?.name + " logo"}
                    className="h-5 w-5 mr-1"
                  />
                )}
                {fullSelectedCharity?.name}
                {Object.keys(fullSelectedCharity?.addressesByChain || {}).map((charityNetwork) => (
                  <DynamicImage
                    key={charityNetwork}
                    path={`axelarChains/${charityNetwork}.svg`}
                    alt={charityNetwork}
                    className="h-5 w-5 ml-1"
                  />
                ))}
              </div>
            ) : (
              "Select charity..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search charity..." />
            <CommandList>
              <CommandEmpty>No charity found.</CommandEmpty>
              <CommandGroup>
                {filteredCharities.map((charity) => (
                  <CommandItem
                    key={charity.id}
                    value={charity.id}
                    onSelect={(currentValue) => {
                      setSelectedCharity(currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", selectedCharity === charity.id ? "opacity-100" : "opacity-0")}
                    />
                    {charity?.logo && <img src={charity.logo} alt={charity?.name + " logo"} className="h-5 w-5 mr-1" />}
                    {charity.name}
                    {Object.keys(charity?.addressesByChain || {}).map((charityNetwork) => (
                      <DynamicImage
                        key={charityNetwork}
                        path={`axelarChains/${charityNetwork}.svg`}
                        alt={charityNetwork}
                        className="h-5 w-5 ml-1"
                      />
                    ))}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
