import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import DailyRotateFile = require('winston-daily-rotate-file');

const dailyRotateFileOptions = {
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxFiles: '7d',
};

export const winstonOptions = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike('MyApp', {
          prettyPrint: true,
        }),
      ),
    }),

    new DailyRotateFile({
      level: 'info',
      filename: 'logs/info-%DATE%.log',
      ...dailyRotateFileOptions,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    new DailyRotateFile({
      level: 'error',
      filename: 'logs/error-%DATE%.log',
      ...dailyRotateFileOptions,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};
