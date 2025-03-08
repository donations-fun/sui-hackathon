import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@monorepo/common/database/prisma.service';
import { InfoByChain } from '@monorepo/common/database/entities/tokenInfo';

@Injectable()
export class TokenRepository {
  private readonly logger: Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(TokenRepository.name);
  }

  async getAll() {
    return this.prisma.token.findMany();
  }

  async getAllAnalytic() {
    return this.prisma.token.findMany({
      where: {
        analytic: true,
      },
    });
  }

  async getAllAnalyticAddresses() {
    const tokens = await this.prisma.token.findMany({
      where: {
        analytic: true,
      },
    });

    return tokens.reduce<Record<string, boolean>>((acc, token) => {
      // @ts-ignore
      for (const info of Object.values(token.infoByChain as InfoByChain)) {
        acc[info.tokenAddress as string] = true;
      }

      return acc;
    }, {});
  }
}
