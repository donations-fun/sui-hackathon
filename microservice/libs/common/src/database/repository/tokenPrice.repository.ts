import { Injectable } from '@nestjs/common';
import { PrismaService } from '@monorepo/common/database/prisma.service';
import { TokenExtended } from '@monorepo/common/database/entities/tokenInfo';
import { TokenPrice } from "@prisma/client";

@Injectable()
export class TokenPriceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdate(chain: string, token: TokenExtended, price: string) {
    await this.prisma.tokenPrice.upsert({
      create: {
        chain,
        tokenAddress: token.currentChainInfo.tokenAddress,
        name: token.name,
        symbol: token.symbol,
        logo: token.logo,
        decimals: token.currentChainInfo.decimals,
        itsTokenId: token.itsTokenId,
        lastUsdPrice: price,
      },
      where: {
        chain_tokenAddress: {
          chain,
          tokenAddress: token.currentChainInfo.tokenAddress,
        },
      },
      update: {
        lastUsdPrice: price,
      },
    });
  }

  async getAllIndexedByAddress() {
    const tokenPrices = await this.prisma.tokenPrice.findMany();

    return tokenPrices.reduce<Record<string, TokenPrice>>((acc, price) => {
      acc[price.tokenAddress.toLowerCase()] = price;

      return acc;
    }, {});
  }
}
