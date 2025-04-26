import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@monorepo/common/database/prisma.service';
import {
  AddKnownCharity,
  AddKnownCharityInterchain,
  RemoveKnownCharity, RemoveKnownCharityInterchain,
} from '@monorepo/common/api/entities/donate.events';
import { SUI_AXELAR_CHAIN } from '@monorepo/common/utils/constants';
import { JsonObject } from '@prisma/client/runtime/library';

@Injectable()
export class CharityRepository {
  private readonly logger: Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(CharityRepository.name);
  }

  async createOrUpdateFromAddKnownCharityEvent(event: AddKnownCharity) {
    this.logger.log('add or update charity', event);

    const charity = await this.prisma.charity.findUnique({
      where: {
        id: event.charity_id,
      },
    });

    if (!charity) {
      await this.prisma.charity.create({
        data: {
          id: event.charity_id,
          name: event.charity_name,
          addressesByChain: { [SUI_AXELAR_CHAIN]: event.charity_address },
        },
        select: null,
      });

      return;
    }

    const addressesByChain = {
      ...(charity.addressesByChain as JsonObject),
      [SUI_AXELAR_CHAIN]: event.charity_address,
    };

    await this.prisma.charity.update({
      where: {
        id: event.charity_id,
      },
      data: {
        addressesByChain,
      },
    });
  }

  async updateFromRemoveKnownCharityEvent(event: RemoveKnownCharity) {
    this.logger.log('remove charity', event);

    const charity = await this.prisma.charity.findUnique({
      where: {
        id: event.charity_id,
      },
    });

    if (!charity) {
      return;
    }

    const addressesByChain = {
      ...(charity.addressesByChain as JsonObject),
    };
    delete addressesByChain[SUI_AXELAR_CHAIN];

    await this.prisma.charity.update({
      where: {
        id: event.charity_id,
      },
      data: {
        addressesByChain,
      },
    });
  }

  async createOrUpdateFromAddKnownCharityInterchainEvent(event: AddKnownCharityInterchain) {
    this.logger.log('add or update charity interchain', event);

    const charityAddress = '0x' + Buffer.from(event.charity_address).toString('hex');

    const charity = await this.prisma.charity.findUnique({
      where: {
        id: event.charity_id,
      },
    });

    if (!charity) {
      await this.prisma.charity.create({
        data: {
          id: event.charity_id,
          name: event.charity_name,
          addressesByChain: { [event.destination_chain]: charityAddress },
        },
        select: null,
      });

      return;
    }

    const addressesByChain = {
      ...(charity.addressesByChain as JsonObject),
      [event.destination_chain]: charityAddress,
    };

    await this.prisma.charity.update({
      where: {
        id: event.charity_id,
      },
      data: {
        addressesByChain,
      },
    });
  }

  async updateFromRemoveKnownCharityInterchainEvent(event: RemoveKnownCharityInterchain) {
    this.logger.log('remove charity interchain', event);

    const charity = await this.prisma.charity.findUnique({
      where: {
        id: event.charity_id,
      },
    });

    if (!charity) {
      return;
    }

    const addressesByChain = {
      ...(charity.addressesByChain as JsonObject),
    };
    delete addressesByChain[event.destination_chain];


    await this.prisma.charity.update({
      where: {
        id: event.charity_id,
      },
      data: {
        addressesByChain,
      },
    });
  }

  async getAll() {
    return this.prisma.charity.findMany();
  }
}
