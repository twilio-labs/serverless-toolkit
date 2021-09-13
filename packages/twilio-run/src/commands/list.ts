import { TwilioServerlessApiClient } from '@twilio-labs/serverless-api';
import { Argv } from 'yargs';
import { checkConfigForCredentials } from '../checks/check-credentials';
import checkForValidServiceSid from '../checks/check-service-sid';
import checkLegacyConfig from '../checks/legacy-config';
import { getConfigFromFlags, ListCliFlags, ListConfig } from '../config/list';
import {
  ALL_FLAGS,
  BASE_API_FLAG_NAMES,
  BASE_CLI_FLAG_NAMES,
  getRelevantFlags,
} from '../flags';
import { printListResult } from '../printers/list';
import {
  getDebugFunction,
  logApiError,
  logger,
  setLogLevelByName,
} from '../utils/logger';
import { ExternalCliOptions } from './shared';
import { CliInfo } from './types';
import { getFullCommand } from './utils';

const debug = getDebugFunction('twilio-run:list');

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
  flags: ListCliFlags,
  externalCliOptions?: ExternalCliOptions
): Promise<void> {
  setLogLevelByName(flags.logLevel);

  await checkLegacyConfig(flags.cwd, false);

  let config: ListConfig;
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

  if (config.types !== 'services' && config.types[0] !== 'services') {
    const command = getFullCommand(flags);
    checkForValidServiceSid(command, config.serviceSid);
  }

  try {
    const client = new TwilioServerlessApiClient(config);
    const result = await client.list({ ...config });
    printListResult(result, config, config.outputFormat);
  } catch (err) {
    handleError(err);
  }
}

export const cliInfo: CliInfo = {
  argsDefaults: {
    types: 'services',
  },
  options: {
    ...getRelevantFlags([
      ...BASE_CLI_FLAG_NAMES,
      ...BASE_API_FLAG_NAMES,
      'service-name',
      'properties',
      'extended-output',
      'service-sid',
      'output-format',
    ]),
    environment: {
      ...ALL_FLAGS['environment'],
      describe: 'The environment to list variables for',
      default: 'dev',
    },
  },
};

function optionBuilder(yargs: Argv<any>): Argv<ListCliFlags> {
  if (cliInfo.argsDefaults) {
    yargs = Object.keys(cliInfo.argsDefaults).reduce(
      (yargs: Argv<any>, name: string) => {
        if (cliInfo.argsDefaults && cliInfo.argsDefaults[name]) {
          return yargs.default(name, cliInfo.argsDefaults[name]);
        }
        return yargs;
      },
      yargs
    );
  }

  yargs = yargs
    .example(
      '$0 list services',
      'Lists all existing services/projects associated with your Twilio Account'
    )
    .example(
      '$0 ls functions,assets --environment=dev --service-name=demo',
      'Lists all existing functions & assets associated with the `dev` environment of this service/project'
    )
    .example(
      '$0 ls environments --service-sid=ZSxxxxx --extended-output',
      'Outputs all environments for a specific service with extended output for better parsing'
    )
    .example(
      '$0 ls assets,variables,functions --properties=sid,date_updated',
      'Only lists the SIDs and date of last update for assets, variables and function'
    );

  yargs = Object.keys(cliInfo.options).reduce((yargs, name) => {
    return yargs.option(name, cliInfo.options[name]);
  }, yargs);

  return yargs;
}

export const command = ['list [types]', 'ls [types]'];
export const describe =
  'List existing services, environments, variables, deployments for your Twilio Serverless Account';
export const builder = optionBuilder;
