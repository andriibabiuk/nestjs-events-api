import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageFormatterService } from './message-formater/message-formater.service';
import { LoggerService } from './logger/logger.service';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [TasksModule],
  controllers: [AppController],
  providers: [AppService, MessageFormatterService, LoggerService],
})
export class AppModule {}
