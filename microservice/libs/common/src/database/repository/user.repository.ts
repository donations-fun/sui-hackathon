import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserV2 } from 'twitter-api-v2';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByAddress(address: string) {
    return this.prisma.user.findFirst({
      where: {
        addresses: {
          has: address.toLowerCase(),
        },
      },
    });
  }

  async findByTwitterId(twitterId: string) {
    return this.prisma.user.findUnique({
      where: {
        twitterId,
      },
    });
  }

  async updateUserTwitter(address: string, twitterUser: UserV2) {
    await this.prisma.user.upsert({
      where: {
        twitterId: twitterUser.id,
      },
      update: {
        addresses: {
          push: address.toLowerCase(),
        },
      },
      create: {
        twitterId: twitterUser.id,
        twitterUsername: twitterUser.username,
        addresses: [address.toLowerCase()],
      },
    });
  }
}
