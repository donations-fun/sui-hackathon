import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { GeneralService } from './services/general.service';

@ApiTags('general')
@Controller('/general')
export class GeneralController {
  constructor(private readonly generalService: GeneralService) {}

  @Get('/coins-metadata')
  async getCoinsMetadata(@Query('coinTypes') coinTypes: string) {
    return await this.generalService.getCoinsMetadata(coinTypes.split(',').filter((coinType) => !!coinType));
  }
}
