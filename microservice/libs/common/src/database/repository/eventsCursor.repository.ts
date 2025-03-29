import { Injectable } from '@nestjs/common';
import { PrismaService } from '@monorepo/common/database/prisma.service';
import { EventId } from '@mysten/sui/client';

@Injectable()
export class EventsCursorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getLatestCursor(type: string) {
    const cursor = await this.prisma.eventsCursor.findUnique({
      where: {
        id: type,
      },
    });

    return cursor || undefined;
  }

  async saveLatestCursor(type: string, cursor: EventId) {
    const data = {
      eventSeq: cursor.eventSeq,
      txDigest: cursor.txDigest,
    };

    return this.prisma.eventsCursor.upsert({
      where: {
        id: type,
      },
      update: data,
      create: { id: type, ...data },
    });
  }
}
