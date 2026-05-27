import { Module } from '@nestjs/common';
import { DatabaseModule } from './common/database/database.module';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    // DatabaseModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'info',
        transport: {
          targets: [
            {
              target: 'pino/file',
              level: 'info',
              options: { destination: './logs/info.log', mkdir: true },
            },
            {
              target: 'pino/file',
              level: 'warn',
              options: { destination: './logs/warn.log', mkdir: true },
            },
            {
              target: 'pino/file',
              level: 'error',
              options: { destination: './logs/error.log', mkdir: true },
            },
            {
              target: 'pino/file',
              level: 'debug',
              options: { destination: './logs/debug.log', mkdir: true },
            },
            {
              target: 'pino-pretty',
              options: { colorize: true },
            },
          ],
        },
      },
    }),
  ],
})
export class AppModule {}
