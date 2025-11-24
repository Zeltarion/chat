import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const isProd = process.env.NODE_ENV === 'production';

const logDir = process.env.LOG_DIR || 'logs';

export const winstonConfig: WinstonModuleOptions = {
  level: isProd ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    // Console: debug/info for dev, info for prod
    new winston.transports.Console({
      level: isProd ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf((info) => {
          const { level, message, timestamp, context, ...meta } =
            info as winston.Logform.TransformableInfo & { context?: unknown };

          const ts =
            typeof timestamp === 'string'
              ? timestamp
              : new Date().toISOString();

          const levelStr = String(level);

          const msgStr =
            typeof message === 'string' ? message : JSON.stringify(message);

          const ctx =
            typeof context === 'string' && context.length > 0
              ? ` [${context}]`
              : '';

          const hasMeta = Object.keys(meta).length > 0;
          const metaString = hasMeta ? ` ${JSON.stringify(meta)}` : '';

          return `${ts} ${levelStr}${ctx}: ${msgStr}${metaString}`;
        }),
      ),
    }),

    // Write only warn and error with rotation by days
    new DailyRotateFile({
      dirname: logDir,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '14d',
      level: 'warn',
    }),
  ],
};
