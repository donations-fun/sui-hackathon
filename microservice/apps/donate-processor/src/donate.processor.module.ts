import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { CronsModule } from './crons/crons.module';

@Module({
  imports: [CronsModule, ApiModule],
  providers: [],
  exports: [],
})
export class DonateProcessorModule {}
