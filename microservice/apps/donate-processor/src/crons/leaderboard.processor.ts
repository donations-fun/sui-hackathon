import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { TokenPriceRepository } from '@monorepo/common/database/repository/tokenPrice.repository';
import { Cron } from '@nestjs/schedule';
import { DonationRepository } from '@monorepo/common/database/repository/donation.repository';
import { UserLeaderboardRepository } from '@monorepo/common/database/repository/userLeaderboard.repository';
import { LastProcessedDonationRepository } from '@monorepo/common/database/repository/lastProcessedDonation.repository';
import { DonationExtended, DonationExtendedWithId } from '@monorepo/common/database/entities/donation.extended';
import { TokenPrice } from '@prisma/client';
import BigNumber from 'bignumber.js';
import { Locker } from '@monorepo/common/utils/locker';
import { TokenRepository } from '@monorepo/common/database/repository/token.repository';
import { ALL_AXELAR_CHAINS } from '@monorepo/common/utils/constants';

@Injectable()
export class LeaderboardProcessor implements OnModuleInit {
  private readonly logger = new Logger(LeaderboardProcessor.name);

  constructor(
    private readonly donationsRepository: DonationRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly tokenPriceRepository: TokenPriceRepository,
    private readonly userLeaderBoardRepository: UserLeaderboardRepository,
    private readonly lastProcessedDonationRepository: LastProcessedDonationRepository,
  ) {}

  async onModuleInit() {
    await this.updateLeaderboard();
  }

  @Cron('5/30 * * * *') // Every 30 minutes starting from minute 5 to be after the prices processing
  async updateLeaderboard(): Promise<void> {
    await Locker.lock('update leaderboard', async () => {
      this.logger.debug('Starting to update leaderboard...');

      const tokenPrices = await this.tokenPriceRepository.getAllIndexedByAddress();
      const allAnalyticAddresses = await this.tokenRepository.getAllAnalyticAddresses();

      for (const chain of ALL_AXELAR_CHAINS) {
        this.logger.debug(`Processing leaderboard for chain ${chain}`);

        const lastProcessedDonation = (await this.lastProcessedDonationRepository.getLastProcessedDonation(chain)) || {
          lastDonationId: 0,
          chain,
          lastTwitterUsername: null,
        };

        const limit = 100;

        try {
          let donations = [];
          do {
            donations = await this.donationsRepository.getDonationsAfterId(
              lastProcessedDonation.lastDonationId,
              chain,
              limit,
            );

            const donationsByUsername = donations.reduce<Record<string, DonationExtendedWithId[]>>((acc, donation) => {
              if (!(donation.user in acc)) {
                acc[donation.user] = [];
              }

              acc[donation.user].push(donation);

              return acc;
            }, {});

            let foundLastUsername = !lastProcessedDonation.lastTwitterUsername;
            for (const [username, donations] of Object.entries(donationsByUsername)) {
              // Skip users for which we have processed donations
              if (!foundLastUsername) {
                if (username === lastProcessedDonation.lastTwitterUsername) {
                  foundLastUsername = true;
                }

                continue;
              }

              await this.processUserDonations(
                chain,
                username,
                donations,
                tokenPrices,
                allAnalyticAddresses,
                lastProcessedDonation.lastDonationId,
              );

              // Save partial progress
              lastProcessedDonation.lastTwitterUsername = username;
            }

            const lastDonation = donations.pop();

            if (!lastDonation) {
              break;
            }

            // Save progress
            lastProcessedDonation.lastDonationId = lastDonation.id;
            lastProcessedDonation.lastTwitterUsername = null;
            await this.lastProcessedDonationRepository.updateLastProcessedDonation(
              chain,
              lastProcessedDonation.lastDonationId,
              null,
            );
          } while (donations.length >= limit);
        } catch (e) {
          this.logger.fatal('Something went wrong when calculating leaderboard, partial progress should be saved', e);
        } finally {
          // Save progress if anything happens
          await this.lastProcessedDonationRepository.updateLastProcessedDonation(
            chain,
            lastProcessedDonation.lastDonationId,
            lastProcessedDonation.lastTwitterUsername,
          );
        }

        this.logger.debug(`Successfully processed leaderboard for ${chain}.`);
      }

      this.logger.debug('Successfully processed leaderboard for all chains.');
    });
  }

  private async processUserDonations(
    chain: string,
    twitterUsername: string,
    donations: DonationExtendedWithId[],
    tokenPrices: Record<string, TokenPrice>,
    allAnalyticAddresses: Record<string, boolean>,
    lastDonationId: number,
  ) {
    let newUsdValue = this.processUserDonationsRaw(donations, tokenPrices, allAnalyticAddresses);

    const existingUserLeaderboard = await this.userLeaderBoardRepository.findExistingUser(chain, twitterUsername);

    // If user does not exist but we have already started processing donations, check for older values and add them to the total
    // If this process fails, the whole process for this user will be retried
    if (!existingUserLeaderboard && lastDonationId) {
      const olderUsdValue = await this.processOlderUserDonations(
        chain,
        twitterUsername,
        tokenPrices,
        allAnalyticAddresses,
        lastDonationId,
      );

      newUsdValue = newUsdValue.plus(olderUsdValue);
    }

    this.logger.log(
      `Processed leaderboard for user ${twitterUsername} for chain ${chain}, added ${newUsdValue.toFixed()} USD`,
    );

    // If user doesn't exist, create leaderboard entry. Else update it with the new total
    if (!existingUserLeaderboard) {
      await this.userLeaderBoardRepository.create(chain, twitterUsername, newUsdValue);
    } else {
      newUsdValue = newUsdValue.plus(existingUserLeaderboard.lastUsdValue);

      await this.userLeaderBoardRepository.update(chain, twitterUsername, newUsdValue);
    }
  }

  private async processOlderUserDonations(
    chain: string,
    twitterUsername: string,
    tokenPrices: Record<string, TokenPrice>,
    allAnalyticAddresses: Record<string, boolean>,
    lastDonationId: number,
  ) {
    this.logger.debug(`Found a new user ${twitterUsername}, processing older donations for ${chain}`);

    let olderUsdValue = new BigNumber('0');

    let donations = [];
    let offset = 0;
    do {
      donations = await this.donationsRepository.getAccountDonationsBeforeIdInclusive(
        lastDonationId,
        twitterUsername,
        offset,
        chain,
      );

      const newUsdValue = this.processUserDonationsRaw(donations, tokenPrices, allAnalyticAddresses);

      olderUsdValue = olderUsdValue.plus(newUsdValue);

      offset += 10;
    } while (donations.length >= 10);

    return olderUsdValue;
  }

  private processUserDonationsRaw(
    donations: DonationExtended[],
    tokenPrices: Record<string, TokenPrice>,
    allAnalyticAddresses: Record<string, boolean>,
  ) {
    let newUsdValue = new BigNumber('0');

    for (const donation of donations) {
      // Don't process donations that are not with analytic tokens
      if (!(donation.token.toLowerCase() in allAnalyticAddresses)) {
        continue;
      }

      const price = tokenPrices?.[donation.token.toLowerCase()];

      if (!price) {
        throw new Error(
          `There is no price for token ${donation.token} on chain ${donation.onDestChain ? donation.chain : donation.sourceChain || donation.chain}. Retrying later`,
        );
      }

      const usdPrice = new BigNumber(donation.amount).shiftedBy(-price.decimals).multipliedBy(price.lastUsdPrice);

      // this.logger.debug(`Calculated usd price for token ${donation.token} for amount ${donation.amount} as ${usdPrice} USD`);

      newUsdValue = newUsdValue.plus(usdPrice);
    }

    return newUsdValue;
  }
}
