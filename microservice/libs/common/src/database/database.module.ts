import { PrismaService } from '@monorepo/common/database/prisma.service';
import { Module } from '@nestjs/common';
import { CharityRepository } from '@monorepo/common/database/repository/charity.repository';
import { TokenRepository } from '@monorepo/common/database/repository/token.repository';
import { UserRepository } from '@monorepo/common/database/repository/user.repository';
import { DonationRepository } from '@monorepo/common/database/repository/donation.repository';
import { EventsCursorRepository } from '@monorepo/common/database/repository/eventsCursor.repository';
import { TokenPriceRepository } from '@monorepo/common/database/repository/tokenPrice.repository';
import { UserLeaderboardRepository } from "@monorepo/common/database/repository/userLeaderboard.repository";
import { LastProcessedDonationRepository } from "@monorepo/common/database/repository/lastProcessedDonation.repository";

@Module({
  providers: [
    PrismaService,
    CharityRepository,
    TokenRepository,
    UserRepository,
    DonationRepository,
    EventsCursorRepository,
    TokenPriceRepository,
    UserLeaderboardRepository,
    LastProcessedDonationRepository,
  ],
  exports: [
    CharityRepository,
    TokenRepository,
    UserRepository,
    DonationRepository,
    EventsCursorRepository,
    TokenPriceRepository,
    UserLeaderboardRepository,
    LastProcessedDonationRepository,
  ],
})
export class DatabaseModule {}
