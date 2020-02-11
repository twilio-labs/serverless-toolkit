import { LogList, LogApiResource } from '@twilio-labs/serverless-api';
import { LogsConfig } from '../config/logs';
import { logger } from '../utils/logger';

export function printLogs(result: LogApiResource[], config: LogsConfig) {
  result.forEach(printLog);
}

export function printLog(log: LogApiResource) {
  logger.info(`[${log.level}][${log.date_created}]: ${log.message}`);
}
