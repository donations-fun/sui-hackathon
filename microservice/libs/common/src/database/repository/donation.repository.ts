import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Donation, Prisma } from '@prisma/client';
import { DonationExtended } from '@monorepo/common/database/entities/donation.extended';
import { DonationEvent, DonationInterchainEvent } from '@monorepo/common/api/entities/donate.events';
import { SUI_AXELAR_CHAIN, SUI_TOKEN_TYPE, SUI_TOKEN_TYPE_LONG } from '@monorepo/common/utils/constants';

@Injectable()
export class DonationRepository {
  private readonly logger: Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(DonationRepository.name);
  }

  async createDonationFromDonationEvent(
    event: DonationEvent,
    tokenType: string,
    txHash: string,
    processedBlock: number,
  ): Promise<Donation | null> {
    if (tokenType === SUI_TOKEN_TYPE_LONG) {
      tokenType = SUI_TOKEN_TYPE;
    }

    this.logger.log('Create new donation', event, tokenType);

    try {
      return await this.prisma.donation.create({
        data: {
          chain: SUI_AXELAR_CHAIN,
          userAddress: event.user,
          token: tokenType,
          charityId: event.charity_id,
          charityName: event.charity_name,
          amount: event.amount,
          txHash,
          processedBlock,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint fails
        if (e.code === 'P2002') {
          return null;
        }
      }
      throw e;
    }
  }

  async createDonationFromDonationInterchainEvent(
    event: DonationInterchainEvent,
    tokenType: string,
    txHash: string,
    processedBlock: number,
  ): Promise<Donation | null> {
    if (tokenType === SUI_TOKEN_TYPE_LONG) {
      tokenType = SUI_TOKEN_TYPE;
    }

    this.logger.log('Create new donation', event, tokenType);

    try {
      return await this.prisma.donation.create({
        data: {
          chain: event.destination_chain,
          userAddress: event.user,
          token: tokenType,
          charityId: event.charity_id,
          charityName: event.charity_name,
          amount: event.amount,
          sourceChain: SUI_AXELAR_CHAIN,
          txHash,
          processedBlock,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint fails
        if (e.code === 'P2002') {
          return null;
        }
      }
      throw e;
    }
  }

  async getLatestDonations(chain?: string) {
    return this.prisma.$queryRaw<DonationExtended[]>`
        SELECT d.chain,
               COALESCE(u."twitterUsername", d."userAddress", d."sourceAddress") as "user",
               d.token,
               d."charityId",
               d.amount,
               d."sourceChain",
               d."txHash",
               d."createdAt",
               d."sourceAddress" IS NOT NULL                                     as "onDestChain"
        from "Donation" d
                 LEFT JOIN "User" u
                           ON (u.addresses @> ARRAY [COALESCE(d."userAddress", d."sourceAddress")])
            ${chain ? Prisma.sql`where d.chain = ${chain}` : Prisma.empty}
        ORDER BY d."createdAt" DESC
        LIMIT 10
    `;
  }

  async getAccountDonations(twitterUsername: string, offset: number, chain?: string) {
    return this.prisma.$queryRaw<DonationExtended[]>`
        SELECT d.chain,
               COALESCE(d."userAddress", d."sourceAddress") as "user",
               d.token,
               d."charityId",
               d.amount,
               d."sourceChain",
               d."txHash",
               d."createdAt",
               d."sourceAddress" IS NOT NULL                as "onDestChain"
        from "Donation" d
                 JOIN "User" u
                      ON (u.addresses @> ARRAY [COALESCE(d."userAddress", d."sourceAddress")])
        where u."twitterUsername" = ${twitterUsername}
            ${chain ? Prisma.sql`and d.chain = ${chain}` : Prisma.empty}
        ORDER BY d."createdAt" DESC
        OFFSET ${offset} LIMIT 10
    `;
  }
}
