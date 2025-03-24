import { Controller, Get, Param } from '@nestjs/common';
import { DonationRepository } from '@monorepo/common/database/repository/donation.repository';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { DonationExtended } from '@monorepo/common/database/entities/donation.extended';

@ApiTags('donations')
@Controller('/donations')
export class DonationsController {
  constructor(private readonly donationsRepository: DonationRepository) {}

  @Get('/latest/:chain?')
  @ApiParam({ name: 'chain', required: false })
  async getLatestDonations(@Param('chain') chain?: string): Promise<DonationExtended[]> {
    if (!chain) {
      return this.donationsRepository.getLatestDonations();
    }

    return this.donationsRepository.getLatestDonations(chain);
  }
}
