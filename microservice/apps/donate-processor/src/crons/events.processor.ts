import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Locker } from '@monorepo/common/utils/locker';
import { EventId, SuiClient, SuiEvent, SuiEventFilter } from '@mysten/sui/client';
import { EventsCursorRepository } from '@monorepo/common/database/repository/eventsCursor.repository';
import { ApiConfigService } from '@monorepo/common/config/api.config.service';

type EventTracker = {
  type: string;
  filter: SuiEventFilter;
};

@Injectable()
export class EventsProcessor {
  private readonly logger = new Logger(EventsProcessor.name);

  private readonly eventToTrack: EventTracker;

  constructor(
    private readonly suiClient: SuiClient,
    private readonly eventsCursorRepository: EventsCursorRepository,
    apiConfigService: ApiConfigService,
  ) {
    this.eventToTrack = {
      type: `${apiConfigService.getContractPackageId()}::donate`,
      filter: {
        MoveEventModule: {
          module: 'donate',
          package: apiConfigService.getContractPackageId(),
        },
      },
    };
  }

  @Cron('5/30 * * * * *') // Every 30 seconds starting from second 5
  async pollEvents(): Promise<void> {
    await Locker.lock('pollEvents', async () => {
      this.logger.debug('Starting to poll events...');

      let cursor: EventId | null | undefined = await this.eventsCursorRepository.getLatestCursor(
        this.eventToTrack.type,
      );
      let hasNextPage = false;
      do {
        if (hasNextPage) {
          // Wait 2 seconds before fetching next page if there are multiple
          await new Promise((resolve) => {
            setTimeout(resolve, 2000);
          });
        }

        ({ cursor, hasNextPage } = await this.runEventJob(cursor));
      } while (hasNextPage);

      this.logger.debug('Successfully processed poll events.');
    });
  }

  async runEventJob(cursor?: EventId | null) {
    try {
      const { data, hasNextPage, nextCursor } = await this.suiClient.queryEvents({
        query: this.eventToTrack.filter,
        cursor,
        order: 'ascending',
        limit: 10,
      });

      await this.handleDonateEvents(data, this.eventToTrack.type);

      if (nextCursor && data.length > 0) {
        await this.eventsCursorRepository.saveLatestCursor(this.eventToTrack.type, nextCursor);
      }

      return { cursor: nextCursor, hasNextPage };
    } catch (e) {
      this.logger.error('Failed to fetch events', e);
    }

    return { cursor: undefined, hasNextPage: false };
  }

  async handleDonateEvents(events: SuiEvent[], type: string) {
    const eventsByType = new Map<string, any[]>();

    for (const event of events) {
      if (!event.type.startsWith(type)) throw new Error('Invalid event module origin');
      const eventData = eventsByType.get(event.type) || [];
      eventData.push(event.parsedJson);
      eventsByType.set(event.type, eventData);
    }

    await Promise.all(
      Array.from(eventsByType.entries()).map(async ([eventType, events]) => {
        const eventName = eventType.split('::').pop() || eventType;
        switch (eventName) {
          case 'AddKnownCharity':
            // TODO: handle AddKnownCharity
            // await prisma.addKnownCharity.createMany({
            //   data: events as Prisma.AddKnownCharityCreateManyInput[],
            // });
            console.log('Created AddKnownCharity events', events);
            break;
          case 'RemoveKnownCharity':
            // TODO: handle RemoveKnownCharity
            // await prisma.removeKnownCharity.createMany({
            //   data: events as Prisma.RemoveKnownCharityCreateManyInput[],
            // });
            console.log('Created RemoveKnownCharity events', events);
            break;
          case 'AddKnownCharityInterchain':
            // TODO: handle AddKnownCharityInterchain
            // await prisma.addKnownCharityInterchain.createMany({
            //   data: events as Prisma.AddKnownCharityInterchainCreateManyInput[],
            // });
            console.log('Created AddKnownCharityInterchain events', events);
            break;
          case 'RemoveKnownCharityInterchain':
            // TODO: handle RemoveKnownCharityInterchain
            // await prisma.removeKnownCharityInterchain.createMany({
            //   data: events as Prisma.RemoveKnownCharityInterchainCreateManyInput[],
            // });
            console.log('Created RemoveKnownCharityInterchain events', events);
            break;
          case 'AddAnalyticToken':
            // TODO: handle AddAnalyticToken
            // await prisma.addAnalyticToken.createMany({
            //   data: events as Prisma.AddAnalyticTokenCreateManyInput[],
            // });
            console.log('Created AddAnalyticToken events', events);
            break;
          case 'RemoveAnalyticToken':
            // TODO: handle RemoveAnalyticToken
            // await prisma.removeAnalyticToken.createMany({
            //   data: events as Prisma.RemoveAnalyticTokenCreateManyInput[],
            // });
            console.log('Created RemoveAnalyticToken events', events);
            break;
          case 'Donation':
            // TODO: handle Donation
            // await prisma.donation.createMany({
            //   data: events as Prisma.DonationCreateManyInput[],
            // });
            console.log('Created Donation events', events);
            break;
          case 'DonationInterchain':
            // TODO: handle DonationInterchain
            // await prisma.donationInterchain.createMany({
            //   data: events as Prisma.DonationInterchainCreateManyInput[],
            // });
            console.log('Created DonationInterchain events', events);
            break;
          default:
            console.log('Unknown event type:', eventName);
        }
      }),
    );
  }
}
