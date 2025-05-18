import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartNoAxesCombined, Loader2 } from 'lucide-react';
import React from "react";
import { ChainsFilter } from "@/components/chains-filter";
import { useChainsFilter } from "@/hooks/useChainsFilter";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Leaderboard() {
  const { chains, filteredChain, setFilteredChain } = useChainsFilter();

  const { leaderboard, isLoading } = useLeaderboard(filteredChain);

  return (
    <Card className="relative py-4 bg-white shadow-lg sm:rounded-3xl lg:p-6">
      <CardHeader>
        <CardTitle className="mb-1 flex">
          Leaderboard {isLoading && <Loader2 className="inline-flex h-4 w-4 animate-spin" />}

          <ChartNoAxesCombined className="ml-1 h-4 w-4" />
        </CardTitle>

        <div className="flex space-x-1">
          <ChainsFilter chains={chains} filteredChain={filteredChain} setFilteredChain={setFilteredChain} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Rank</TableHead>
              <TableHead>Donor</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading &&
              leaderboard.map((leaderboard, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <a href={`https://x.com/${leaderboard.twitterUsername}`} target="_blank" className="text-sm">
                      <em>@{leaderboard.twitterUsername}</em>
                    </a>
                  </TableCell>
                  <TableCell className="text-right font-medium">${leaderboard.lastUsdValue.toFixed(2)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
