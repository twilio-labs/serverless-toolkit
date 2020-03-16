import { LogList, LogApiResource } from '@twilio-labs/serverless-api';
import { LogsConfig } from '../config/logs';
import { logger } from '../utils/logger';

export function printLogs(
  result: LogApiResource[],
  config: LogsConfig,
  outputFormat?: string
) {
  result.forEach(log => printLog(log, outputFormat));
}

export function printLog(log: LogApiResource, outputFormat?: string) {
  if (outputFormat === 'json') {
    logger.info(JSON.stringify(log));
  } else {
    logger.info(`[${log.level}][${log.date_created}]: ${log.message}`);
  }
}
