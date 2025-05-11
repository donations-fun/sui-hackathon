import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@monorepo/common/database/prisma.service';
import { InfoByChain } from '@monorepo/common/database/entities/tokenInfo';
import { CoinMetadata } from '@mysten/sui/client';
import { SUI_AXELAR_CHAIN, SUI_TOKEN_TYPE, SUI_TOKEN_TYPE_LONG } from '@monorepo/common/utils/constants';
import { JsonObject } from '@prisma/client/runtime/library';

@Injectable()
export class TokenRepository {
  private readonly logger: Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(TokenRepository.name);
  }

  async createOrUpdateFromAddAnalyticTokenEvent(tokenType: string, metadata: CoinMetadata, itsTokenId: string | null) {
    if (tokenType === SUI_TOKEN_TYPE_LONG) {
      tokenType = SUI_TOKEN_TYPE;
    }

    this.logger.log('add or update token', tokenType, metadata, itsTokenId);

    const token = await this.prisma.token.findFirst({
      where: {
        name: metadata.name,
        symbol: metadata.symbol,
      },
    });

    if (!token) {
      await this.prisma.token.create({
        data: {
          name: metadata.name,
          symbol: metadata.symbol,
          // @ts-ignore
          infoByChain: { [SUI_AXELAR_CHAIN]: { tokenAddress: tokenType, decimals: metadata.decimals } } as InfoByChain,
          itsTokenId,
          analytic: true,
          logo: metadata.iconUrl,
        },
        select: null,
      });

      return;
    }

    // @ts-ignore
    const infoByChain: InfoByChain = {
      ...(token.infoByChain as JsonObject),
      [SUI_AXELAR_CHAIN]: { tokenAddress: tokenType, decimals: metadata.decimals },
    };

    await this.prisma.token.updateMany({
      where: {
        name: metadata.name,
        symbol: metadata.symbol,
      },
      data: {
        // @ts-ignore
        infoByChain,
        itsTokenId: token.itsTokenId ?? itsTokenId,
        logo: token.logo ?? metadata.iconUrl,
      },
    });
  }

  async updateFromRemoveAnalyticTokenEvent(metadata: CoinMetadata) {
    this.logger.log('update token', metadata);

    const token = await this.prisma.token.findFirst({
      where: {
        name: metadata.name,
        symbol: metadata.symbol,
      },
    });

    if (!token) {
      return;
    }

    // @ts-ignore
    const infoByChain: InfoByChain = {
      ...(token.infoByChain as JsonObject),
    };
    delete infoByChain[SUI_AXELAR_CHAIN];

    await this.prisma.token.updateMany({
      where: {
        name: metadata.name,
        symbol: metadata.symbol,
      },
      data: {
        // @ts-ignore
        infoByChain,
      },
    });
  }

  async getAll() {
    return this.prisma.token.findMany({
      orderBy: {
        analytic: 'desc',
      },
    });
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
        acc[info.tokenAddress.toLowerCase() as string] = true;
      }

      return acc;
    }, {});
  }
}
