import { SuiClient } from "@mysten/sui/client";

const client = new SuiClient({
  url: "https://fullnode.testnet.sui.io", // TODO: Update for mainnet
});

export const SuiApi = {
  async fetchAllCoins(address: string): Promise<{ [coinType: string]: bigint }> {
    let allCoins = [];
    let cursor: string = undefined;

    try {
      while (true) {
        // Get all coin objects owned by the address
        const {
          data: coins,
          hasNextPage,
          nextCursor,
        } = await client.getAllCoins({
          owner: address,
          cursor,
        });

        allCoins.push(...coins);

        if (hasNextPage && nextCursor) {
          cursor = nextCursor;
        } else {
          break;
        }
      }

      // Sum up the balances
      const totalBalancesByCoin: { [coinType: string]: bigint } = allCoins.reduce((acc, coin) => {
        if (!(coin.coinType in acc)) {
          acc[coin.coinType] = 0n;
        }

        acc[coin.coinType] += BigInt(coin.balance);

        return acc;
      }, {});

      return totalBalancesByCoin;
    } catch (e) {
      console.error(e);

      return {};
    }
  },
};
