import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { DonationExtended } from '@monorepo/common/database/entities/donation.extended';

@Injectable()
export class DonationRepository {
  private readonly logger: Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(DonationRepository.name);
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
}
