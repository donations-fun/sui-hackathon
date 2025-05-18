import { DonationExtended } from "@/hooks/entities/donation.extended";
import { Token } from "@/hooks/entities/token";
import { CoinsMetadata } from "@/api/general";
import { formatAddress, formatBalance } from "@/utils/helpers";
import React from "react";

export function CoinDisplay(props: {
  donation: DonationExtended;
  knownTokensByAddress: { [p: string]: Token };
  coinsMetadata: CoinsMetadata;
}) {
  return (
    <>
      {formatBalance(
        BigInt(props.donation.amount),
        props.knownTokensByAddress?.[props.donation.token]?.infoByChain?.[props.donation.sourceChain]?.decimals ||
          props.coinsMetadata?.[props.donation.token]?.decimals ||
          9,
      )}{" "}
      {props.knownTokensByAddress?.[props.donation.token]?.name ||
        props.coinsMetadata?.[props.donation.token]?.name ||
        formatAddress(props.donation.token)}
    </>
  );
}
