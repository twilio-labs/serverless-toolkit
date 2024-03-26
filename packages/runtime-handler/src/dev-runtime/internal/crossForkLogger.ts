import { LoggerInstance } from '../types';

export class CrossForkLogger implements LoggerInstance {
  constructor() {}

  debug(msg: string) {
    this.sendLog('debug', msg);
  }

  info(msg: string) {
    this.sendLog('info', msg);
  }

  warn(msg: string, title: string = '') {
    this.sendLog('warn', msg, title);
  }

  error(msg: string, title: string = '') {
    this.sendLog('error', msg, title);
  }

  log(msg: string, level: number) {
    this.sendLog('log', msg, level);
  }

  private sendLog(level: keyof LoggerInstance, ...args: (string | number)[]) {
    process.send &&
      process.send({
        crossForkLogMessage: {
          level,
          args: args,
        },
      });
  }
}
