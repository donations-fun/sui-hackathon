import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UserLeaderboardRepository } from '@monorepo/common/database/repository/userLeaderboard.repository';
import { Leaderboard } from "@monorepo/common/database/entities/leaderboard";

@ApiTags('leaderboard')
@Controller('/leaderboard')
export class LeaderboardController {
  constructor(
    private readonly leaderboardRepository: UserLeaderboardRepository,
  ) {}

  @Get('/:chain?')
  @ApiParam({ name: 'chain', required: false })
  async getLeaderboard(@Param('chain') chain?: string): Promise<Leaderboard[]> {
    if (!chain) {
      return this.leaderboardRepository.getTop10All();
    }

    return this.leaderboardRepository.getTop10(chain);
  }
}
