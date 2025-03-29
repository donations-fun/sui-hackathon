import { PrismaService } from '@monorepo/common/database/prisma.service';
import { Module } from '@nestjs/common';
import { CharityRepository } from '@monorepo/common/database/repository/charity.repository';
import { TokenRepository } from '@monorepo/common/database/repository/token.repository';
import { UserRepository } from '@monorepo/common/database/repository/user.repository';
import { DonationRepository } from '@monorepo/common/database/repository/donation.repository';
import { EventsCursorRepository } from '@monorepo/common/database/repository/eventsCursor.repository';

@Module({
  providers: [
    PrismaService,
    CharityRepository,
    TokenRepository,
    UserRepository,
    DonationRepository,
    EventsCursorRepository,
  ],
  exports: [CharityRepository, TokenRepository, UserRepository, DonationRepository, EventsCursorRepository],
})
export class DatabaseModule {}
