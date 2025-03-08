import { PrismaService } from '@monorepo/common/database/prisma.service';
import { Module } from '@nestjs/common';
import { CharityRepository } from '@monorepo/common/database/repository/charity.repository';
import { TokenRepository } from '@monorepo/common/database/repository/token.repository';

@Module({
  providers: [PrismaService, CharityRepository, TokenRepository],
  exports: [CharityRepository, TokenRepository],
})
export class DatabaseModule {}
