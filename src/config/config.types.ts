import * as Joi from 'joi';
import { AppConfig } from './app.config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface ConfigType {
  app: AppConfig;
  database: TypeOrmModuleOptions;
}
export const appConfigSchema = Joi.object({
  APP_MESSAGE_PREFIX: Joi.string().default('Hello '),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5433),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.number().valid(0, 1).required(),
});
