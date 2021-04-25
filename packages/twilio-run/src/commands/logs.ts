import {
  LogApiResource,
  TwilioServerlessApiClient,
} from '@twilio-labs/serverless-api';
import { Argv } from 'yargs';
import { checkConfigForCredentials } from '../checks/check-credentials';
import checkForValidServiceSid from '../checks/check-service-sid';
import checkLegacyConfig from '../checks/legacy-config';
import { getConfigFromFlags, LogsCliFlags, LogsConfig } from '../config/logs';
import {
  ALL_FLAGS,
  BASE_API_FLAG_NAMES,
  BASE_CLI_FLAG_NAMES,
  getRelevantFlags,
} from '../flags';
import { printLog, printLogs } from '../printers/logs';
import {
  getDebugFunction,
  logApiError,
  logger,
  setLogLevelByName,
} from '../utils/logger';
import { ExternalCliOptions } from './shared';
import { CliInfo } from './types';
import { getFullCommand } from './utils';

const debug = getDebugFunction('twilio-run:logs');

function logError(msg: string) {
  logger.error(msg);
}

function handleError(err: Error) {
  debug('%O', err);
  if (err.name === 'TwilioApiError') {
    logApiError(logger, err);
  } else {
    logError(err.message);
  }
  process.exit(1);
}

export async function handler(
  flags: LogsCliFlags,
  externalCliOptions?: ExternalCliOptions
): Promise<void> {
  setLogLevelByName(flags.logLevel);

  await checkLegacyConfig(flags.cwd, false);

  let config: LogsConfig;
  try {
    config = await getConfigFromFlags(flags, externalCliOptions);
  } catch (err) {
    debug(err);
    logError(err.message);
    process.exit(1);
    return;
  }

  if (!config) {
    logError('Internal Error');
    process.exit(1);
    return;
  }

  checkConfigForCredentials(config);
  const command = getFullCommand(flags);
  checkForValidServiceSid(command, config.serviceSid);

  try {
    const client = new TwilioServerlessApiClient(config);
    if (flags.tail) {
      const stream = await client.getLogsStream({ ...config });
      stream.on('data', (log: LogApiResource) => {
        printLog(log, config.outputFormat);
      });
    } else {
      const result = (await client.getLogs({ ...config })) as LogApiResource[];
      printLogs(result, config, config.outputFormat);
    }
  } catch (err) {
    handleError(err);
  }
}

export const cliInfo: CliInfo = {
  options: {
    ...getRelevantFlags([
      ...BASE_CLI_FLAG_NAMES,
      ...BASE_API_FLAG_NAMES,
      'service-sid',
      'function-sid',
      'tail',
      'output-format',
      'log-cache-size',
      'production',
    ]),
    environment: {
      ...ALL_FLAGS['environment'],
      describe: 'The environment to retrieve the logs for',
      default: 'dev',
    },
    production: {
      ...ALL_FLAGS['production'],
      describe:
        'Retrieve logs for the production environment. Overrides the "environment" flag',
    },
  },
};

function optionBuilder(yargs: Argv<any>): Argv<LogsCliFlags> {
  yargs = yargs
    .example(
      '$0 logs',
      'Prints the last 50 logs for the current project in the dev environment'
    )
    .example(
      '$0 logs --environment=stage',
      'Prints the last 50 logs for the current project in the stage environment'
    )
    .example(
      '$0 logs --tail',
      'Tails and prints the logs of the current project'
    )
    .example(
      '$0 logs --function-sid=ZFXXX',
      'Only prints the logs from the named function'
    );

  yargs = Object.keys(cliInfo.options).reduce((yargs, name) => {
    return yargs.option(name, cliInfo.options[name]);
  }, yargs);

  return yargs;
}

export const command = ['logs'];
export const describe = 'Print logs from your Twilio Serverless project';
export const builder = optionBuilder;
