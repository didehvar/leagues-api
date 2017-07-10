import { Logger, transports, config } from 'winston';

const logger = new Logger({
  transports: [
    new transports.Console({
      level: process.env.NODE_ENV === 'test' ? 'error' : process.env.LOG_LEVEL,
      colorize: true,
    }),
  ],
  exceptionHandlers: [new transports.Console({ colorize: true })],
});

export default logger;
