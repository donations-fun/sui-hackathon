import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TokenRepository } from '@monorepo/common/database/repository/token.repository';
import { TokenPriceRepository } from '@monorepo/common/database/repository/tokenPrice.repository';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InfoByChain, TokenExtended } from '@monorepo/common/database/entities/tokenInfo';
import { SUI_AXELAR_CHAIN, SUI_TOKEN_TYPE, SUI_TOKEN_TYPE_LONG } from '@monorepo/common/utils/constants';
import { getTokenPrices } from '@7kprotocol/sdk-ts';
import { Locker } from '@monorepo/common/utils/locker';

// Mock prices to use on testnets, uses mainnet networks instead
const mockPrices: any = {
  'sui-2': {
    // will use mainnet
    '0x2::sui::SUI': '0x2::sui::SUI', // Sui = Sui on mainnet
    '0x383446977921dd1496abbedd150e0752b85f514d3a86b2f131a768847486da68::axlusdc::AXLUSDC':
      '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC', // AxelarUSDC = USDC on mainnet
    '0x434cb7801b4d0670d36c023af8c89648047a07036c0b87b6716d83116d168039::axleth::AXLETH':
      '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN', // AxlETH = Wrapped Ether on mainnet
  },
};

@Injectable()
export class PriceProcessor implements OnModuleInit {
  private readonly logger = new Logger(PriceProcessor.name);

  constructor(
    private readonly tokensRepository: TokenRepository,
    private readonly tokenPriceRepository: TokenPriceRepository,
  ) {}

  async onModuleInit() {
    await this.updatePrices();
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async updatePrices(): Promise<void> {
    await Locker.lock('updatePrices', async () => {
      this.logger.debug('Starting to update token prices...');

      const analyticTokens = await this.tokensRepository.getAllAnalytic();

      this.logger.debug(`Found ${analyticTokens.length} analytic tokens for which to update prices`);

      const suiTokens = analyticTokens.reduce<TokenExtended[]>((acc, token) => {
        // @ts-ignore
        for (const [chain, info] of Object.entries(token.infoByChain as InfoByChain)) {
          // Ignore non Sui chains
          if (chain !== SUI_AXELAR_CHAIN) {
            continue;
          }

          acc.push({
            currentChainInfo: info,
            ...token,
          });
        }

        return acc;
      }, []);

      const suiTokenPrices = await this.getTokenPricesRaw(suiTokens);

      this.logger.debug('Retrieved prices for Sui', suiTokenPrices);

      for (const token of suiTokens) {
        // Mock prices for test networks
        let actualAddress =
          token.currentChainInfo.tokenAddress in mockPrices[SUI_AXELAR_CHAIN]
            ? mockPrices[SUI_AXELAR_CHAIN][token.currentChainInfo.tokenAddress]
            : token.currentChainInfo.tokenAddress;

        if (actualAddress === SUI_TOKEN_TYPE) {
          actualAddress = SUI_TOKEN_TYPE_LONG;
        }

        if (!actualAddress) {
          this.logger.warn(`No mock address found for ${token.currentChainInfo.tokenAddress} - ${token.name}`);

          continue;
        }

        const price = suiTokenPrices?.[actualAddress];

        if (!price) {
          this.logger.error(`Could not get price for token ${token.name} - ${token.currentChainInfo.tokenAddress}`);

          continue;
        }

        try {
          await this.tokenPriceRepository.createOrUpdate(SUI_AXELAR_CHAIN, token, price.toString());
        } catch (e) {
          this.logger.error(`Could not update price for ${token.name} - ${token.currentChainInfo.tokenAddress}`);
        }
      }

      this.logger.debug(`Successfully updated prices!`);
    });
  }

  private async getTokenPricesRaw(tokens: TokenExtended[]) {
    try {
      this.logger.debug(`Fetching prices using 7k Aggregator for tokens ${tokens.map((token) => token.symbol)}`);

      return await getTokenPrices(
        tokens.map((token) => {
          // Mock prices for test networks
          return token.currentChainInfo.tokenAddress in mockPrices[SUI_AXELAR_CHAIN]
            ? mockPrices[SUI_AXELAR_CHAIN][token.currentChainInfo.tokenAddress]
            : token.currentChainInfo.tokenAddress;
        }),
      );
    } catch (e) {
      this.logger.error('Could not fetch token prices using 7k Aggregator...', e);

      return {};
    }
  }
}
