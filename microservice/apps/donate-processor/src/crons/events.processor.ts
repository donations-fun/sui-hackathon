import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Locker } from '@monorepo/common/utils/locker';
import { EventId, SuiClient, SuiEvent, SuiEventFilter } from '@mysten/sui/client';
import { EventsCursorRepository } from '@monorepo/common/database/repository/eventsCursor.repository';
import { ApiConfigService } from '@monorepo/common/config/api.config.service';
import { CharityRepository } from '@monorepo/common/database/repository/charity.repository';
import {
  AddAnalyticToken,
  DonationEvent,
  DonationInterchainEvent,
  RemoveAnalyticToken,
} from '@monorepo/common/api/entities/donate.events';
import { TokenRepository } from '@monorepo/common/database/repository/token.repository';
import { DonationRepository } from '@monorepo/common/database/repository/donation.repository';

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
    private readonly charityRepository: CharityRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly donationRepository: DonationRepository,
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
      eventData.push({ eventId: event.id, ...(event.parsedJson as any) });
      eventsByType.set(event.type, eventData);
    }

    await Promise.all(
      Array.from(eventsByType.entries()).map(async ([eventType, events]) => {
        const eventName = eventType.split('::').pop() || eventType;

        for (const event of events) {
          switch (eventName) {
            case 'AddKnownCharity':
              await this.charityRepository.createOrUpdateFromAddKnownCharityEvent(event);
              break;
            case 'RemoveKnownCharity':
              await this.charityRepository.updateFromRemoveKnownCharityEvent(event);
              break;
            case 'AddKnownCharityInterchain':
              await this.charityRepository.createOrUpdateFromAddKnownCharityInterchainEvent(event);
              break;
            case 'RemoveKnownCharityInterchain':
              await this.charityRepository.updateFromRemoveKnownCharityInterchainEvent(event);
              break;
            case 'AddAnalyticToken':
              const coinType = '0x' + (event as AddAnalyticToken).token.name;
              const metadata = await this.suiClient.getCoinMetadata({
                coinType,
              });

              const itsTokenId = null; // TODO: Get this somehow in the future?

              if (!metadata) {
                this.logger.error(`Receiver AddAnalyticToken event but couldn't fetch metadata for token ${coinType}`);
                return;
              }

              await this.tokenRepository.createOrUpdateFromAddAnalyticTokenEvent(coinType, metadata, itsTokenId);
              break;
            case 'RemoveAnalyticToken':
              const coinType2 = '0x' + (event as RemoveAnalyticToken).token.name;
              const metadata2 = await this.suiClient.getCoinMetadata({
                coinType: coinType2,
              });

              if (!metadata2) {
                this.logger.error(
                  `Receiver RemoveAnalyticToken event but couldn't fetch metadata for token ${coinType2}`,
                );
                return;
              }

              await this.tokenRepository.updateFromRemoveAnalyticTokenEvent(metadata2);
              break;
            case 'Donation':
              const coinType3 = '0x' + (event as DonationEvent).token.name;

              await this.donationRepository.createDonationFromDonationEvent(
                event,
                coinType3,
                event.eventId.txDigest,
                parseInt(event.eventId.eventSeq),
              );
              break;
            case 'DonationInterchain':
              const coinType4 = '0x' + (event as DonationInterchainEvent).token.name;

              await this.donationRepository.createDonationFromDonationInterchainEvent(
                event,
                coinType4,
                event.eventId.txDigest,
                parseInt(event.eventId.eventSeq),
              );
              break;
            default:
              console.log('Unknown event type:', eventName);
          }
        }
      }),
    );
  }
}
