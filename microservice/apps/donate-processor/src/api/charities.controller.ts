import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { Charity } from '@prisma/client';
import { CharityRepository } from '@monorepo/common/database/repository/charity.repository';

@ApiTags('charities')
@Controller('/charities')
export class CharitiesController {
  constructor(private readonly charitiesRepository: CharityRepository) {}

  @Get('/all')
  async getAll(): Promise<Charity[]> {
    return this.charitiesRepository.getAll();
  }
}
