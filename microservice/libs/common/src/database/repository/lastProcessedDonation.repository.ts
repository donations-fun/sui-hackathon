import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LastProcessedDonationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async updateLastProcessedDonation(chain: string, lastDonationId: number, lastTwitterUsername: string | null) {
    await this.prisma.lastProcessedDonation.upsert({
      create: {
        chain,
        lastDonationId,
        lastTwitterUsername,
      },
      where: {
        chain,
      },
      update: {
        lastDonationId,
        lastTwitterUsername,
      },
    });
  }

  async getLastProcessedDonation(chain: string) {
    return this.prisma.lastProcessedDonation.findUnique({
      where: {
        chain,
      },
    });
  }
}
