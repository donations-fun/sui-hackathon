import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '@monorepo/common/database/database.module';
import { EventsProcessor } from './events.processor';
import { ApiModule } from '@monorepo/common/api/api.module';

@Module({
  imports: [
    DatabaseModule,
    ScheduleModule.forRoot(),
    ApiModule,
  ],
  providers: [EventsProcessor],
  exports: [],
})
export class CronsModule {}
