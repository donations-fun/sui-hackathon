import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@monorepo/common/database/prisma.service';
import BigNumber from 'bignumber.js';

@Injectable()
export class UserLeaderboardRepository {
  private readonly logger: Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(UserLeaderboardRepository.name);
  }

  async findExistingUser(chain: string, twitterUsername: string) {
    return this.prisma.userLeaderboard.findUnique({
      where: {
        chain_twitterUsername: {
          chain,
          twitterUsername,
        },
      },
    });
  }

  async create(chain: string, twitterUsername: string, newUsdValue: BigNumber) {
    await this.prisma.userLeaderboard.create({
      data: {
        chain,
        twitterUsername,
        lastUsdValue: newUsdValue.toNumber(),
      },
      select: null,
    });
  }

  async update(chain: string, twitterUsername: string, newUsdValue: BigNumber) {
    await this.prisma.userLeaderboard.update({
      where: {
        chain_twitterUsername: {
          chain,
          twitterUsername,
        },
      },
      data: {
        lastUsdValue: newUsdValue.toNumber(),
      },
      select: null,
    });
  }

  async getTop10(chain: string) {
    return this.prisma.userLeaderboard.findMany({
      where: {
        chain,
      },
      select: {
        chain: false,
        twitterUsername: true,
        lastUsdValue: true,
        createdAt: false,
        updatedAt: false,
      },
      orderBy: {
        lastUsdValue: 'desc',
      },
      take: 10,
    });
  }

  async getTop10All() {
    const result = await this.prisma.userLeaderboard.groupBy({
      by: ['twitterUsername'],
      _sum: {
        lastUsdValue: true,
      },
      orderBy: {
        _sum: {
          lastUsdValue: 'desc',
        },
      },
      take: 10,
    });

    return result.map((item) => ({
      twitterUsername: item.twitterUsername,
      lastUsdValue: item._sum.lastUsdValue || 0,
    }));
  }
}
