import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TwitterService } from './services/twitter.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ReAuthDto, ValidateAuthDto } from './entities/validate.auth.dto';

@ApiTags('twitter')
@Controller({ version: '1' })
export class TwitterController {
  constructor(private twitterService: TwitterService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 120_000, limit: 10 } })
  @Get('/twitter/verification/:address')
  async hasTwitterAccount(@Param('address') address: string): Promise<{ hasTwitterAccount: boolean }> {
    const hasAccount = await this.twitterService.hasTwitterAccount(address);
    return { hasTwitterAccount: hasAccount };
  }

  @UseGuards(ThrottlerGuard)
  @Get('/twitter/url/:address')
  async getTwitterAuthUrl(@Param('address') address: string): Promise<{ url: string }> {
    const url = await this.twitterService.generateTwitterAuthUrl(address);

    return { url };
  }

  @UseGuards(ThrottlerGuard)
  @Post('/twitter/oauth')
  async validateAuth(@Body() dto: ValidateAuthDto): Promise<{
    jwt: string;
    twitterUsername: string;
    address: string;
  }> {
    return await this.twitterService.validateOauth(dto.state, dto.code, dto.address, dto.signature);
  }

  @UseGuards(ThrottlerGuard)
  @Post('/re-auth')
  async reAuth(@Body() dto: ReAuthDto): Promise<{
    jwt: string;
    twitterUsername: string;
    address: string;
  }> {
    return await this.twitterService.reAuth(dto.timestamp, dto.address, dto.signature);
  }
}
