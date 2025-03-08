import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@monorepo/common/database/prisma.service';

@Injectable()
export class CharityRepository {
  private readonly logger: Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(CharityRepository.name);
  }

  async getAll() {
    return this.prisma.charity.findMany();
  }
}
