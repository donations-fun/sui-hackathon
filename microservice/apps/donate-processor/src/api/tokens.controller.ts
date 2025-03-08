import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { TokenRepository } from '@monorepo/common/database/repository/token.repository';
import { Token } from './entities/token';

@ApiTags('tokens')
@Controller('/tokens')
export class TokensController {
  constructor(private readonly tokensRepository: TokenRepository) {}

  @Get('/all')
  async getAll(): Promise<Token[]> {
    // @ts-ignore
    return this.tokensRepository.getAll();
  }
}
