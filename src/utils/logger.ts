import debug from 'debug';
import { errorMessage, warningMessage } from '../printers/utils';

export enum LoggingLevel {
  debug = -1,
  info = 0,
  warn = 1,
  error = 2,
  none = 10,
}

export interface ILogger {
  useDebugModule?: boolean;
  debug(msg: string): void;
  info(msg: string): void;
  warn(msg: string, title?: string): void;
  error(msg: string, title?: string): void;
  log(msg: string, level: LoggingLevel): void;
}

export type LoggerOptions = {
  level: LoggingLevel;
};

export class Logger implements ILogger {
  private logLevel: LoggingLevel;
  public useDebugModule = true;
  constructor({ level }: LoggerOptions) {
    this.logLevel = level;
    if (level === LoggingLevel.debug) {
      const namespaces = ['twilio*'];
      if (process.env.DEBUG) {
        namespaces.push(process.env.DEBUG);
      }
      debug.enable(namespaces.join(','));
    }
  }

  debug(msg: string) {
    this.log(msg, LoggingLevel.debug);
  }

  info(msg: string) {
    this.log(msg, LoggingLevel.info);
  }

  warn(msg: string, title: string = '') {
    msg = warningMessage(title, msg);
    this.log(msg, LoggingLevel.warn);
  }

  error(msg: string, title: string = '') {
    msg = errorMessage(title, msg);
    this.log(msg, LoggingLevel.error);
  }

  log(msg: string, level: LoggingLevel) {
    level = level || LoggingLevel.info;

    if (level >= this.logLevel) {
      const message = typeof msg === 'string' ? msg : JSON.stringify(msg);
      process.stderr.write(message + '\n');
    }
  }
}

export function getDebugFunction(namespace: string) {
  const debugLogger = debug(namespace);
  if (!logger.useDebugModule) {
    debugLogger.enabled = true;
    debug.log = logger.debug.bind(logger);
  }

  return debugLogger;
}

export let logger: ILogger = new Logger({
  level: LoggingLevel.info,
});

export function overrideLogger(newLogger: ILogger) {
  logger = newLogger;
}
