import { Controller, Get, Param, ParseIntPipe, Query, Request, UseGuards } from '@nestjs/common';
import { DonationRepository } from '@monorepo/common/database/repository/donation.repository';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { DonationExtended } from '@monorepo/common/database/entities/donation.extended';
import { JwtPayload } from './entities/jwt.payload';
import { AuthGuard } from '../guards/auth.guard';

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

  @UseGuards(AuthGuard)
  @Get('/my-account/:chain?')
  @ApiParam({ name: 'chain', required: false })
  async getMyAccountDonations(
    @Request() req: any,
    @Query('offset', ParseIntPipe) offset: number = 0,
    @Param('chain') chain?: string,
  ): Promise<DonationExtended[]> {
    const payload = req.user as JwtPayload;

    return this.donationsRepository.getAccountDonations(payload.twitterUsername, offset, chain);
  }

  // TODO: Add endpoint for charity owner to view all donations for it's charity
}
