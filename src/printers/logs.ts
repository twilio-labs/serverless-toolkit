import { LogApiResource } from '@twilio-labs/serverless-api';
import { LogsConfig } from '../config/logs';
import { writeOutput } from '../utils/output';

export function printLogs(
  result: LogApiResource[],
  config: LogsConfig,
  outputFormat?: string
) {
  result.forEach(log => printLog(log, outputFormat));
}

export function printLog(log: LogApiResource, outputFormat?: string) {
  if (outputFormat === 'json') {
    writeOutput(JSON.stringify(log));
  } else {
    writeOutput(`[${log.level}][${log.date_created}]: ${log.message}`);
  }
}
