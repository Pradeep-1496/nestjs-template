import { Module } from '@nestjs/common';
import { LogsModule } from './modules/logs/logs.module';
import { DatabaseModule } from './common/database/database.module';

@Module({
  imports: [
    // DatabaseModule,
    LogsModule,
  ],
})
export class AppModule {}
