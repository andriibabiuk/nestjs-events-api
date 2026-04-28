import { Get, Injectable } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';

@Injectable()
export class AppService {
  constructor(private readonly logger: LoggerService) {}
  @Get()
  getHello(): string {
    return this.logger.log('Hello World!');
  }
}
