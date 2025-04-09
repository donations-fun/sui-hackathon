import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '@monorepo/common/database/database.module';
import { EventsProcessor } from './events.processor';
import { ApiModule } from '@monorepo/common/api/api.module';
import { PriceProcessor } from "./price.processor";

@Module({
  imports: [
    DatabaseModule,
    ScheduleModule.forRoot(),
    ApiModule,
  ],
  providers: [EventsProcessor, PriceProcessor],
  exports: [],
})
export class CronsModule {}
