import { LogList, LogApiResource } from '@twilio-labs/serverless-api';
import { LogsConfig } from '../config/logs';
import { logger } from '../utils/logger';

export function printLogs(
  result: LogApiResource[],
  config: LogsConfig,
  output?: string
) {
  result.forEach(log => printLog(log, output));
}

export function printLog(log: LogApiResource, output?: string) {
  if (output === 'json') {
    logger.info(JSON.stringify(log));
  } else {
    logger.info(`[${log.level}][${log.date_created}]: ${log.message}`);
  }
}
