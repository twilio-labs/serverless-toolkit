import { TwilioServerlessApiClient } from '@twilio-labs/serverless-api';
import { Argv } from 'yargs';
import { checkConfigForCredentials } from '../../checks/check-credentials';
import checkForValidServiceSid from '../../checks/check-service-sid';
import checkLegacyConfig from '../../checks/legacy-config';
import {
  EnvListConfig,
  EnvListFlags,
  getConfigFromFlags,
} from '../../config/env/env-list';
import {
  BASE_API_FLAG_NAMES,
  BASE_CLI_FLAG_NAMES,
  getRelevantFlags,
} from '../../flags';
import { outputVariables } from '../../printers/env/env-list';
import {
  getDebugFunction,
  logApiError,
  logger,
  setLogLevelByName,
} from '../../utils/logger';
import { ExternalCliOptions } from '../shared';
import { CliInfo } from '../types';
import { getFullCommand } from '../utils';

const debug = getDebugFunction('twilio-run:env:get');

function handleError(err: Error) {
  debug('%O', err);
  if (err.name === 'TwilioApiError') {
    logApiError(logger, err);
  } else {
    logger.error(err.message);
  }
  process.exit(1);
}

export async function handler(
  flags: EnvListFlags,
  externalCliOptions?: ExternalCliOptions
) {
  setLogLevelByName(flags.logLevel);

  await checkLegacyConfig(flags.cwd, false);

  let config: EnvListConfig;
  try {
    config = await getConfigFromFlags(flags, externalCliOptions);
  } catch (err) {
    debug(err);
    logger.error(err.message);
    process.exit(1);
    return;
  }

  if (!config) {
    logger.error('Internal Error');
    process.exit(1);
  }

  checkConfigForCredentials(config);
  const command = getFullCommand(flags);
  checkForValidServiceSid(command, config.serviceSid);

  try {
    const client = new TwilioServerlessApiClient(config);
    const result = await client.getEnvironmentVariables(config);

    outputVariables(result, flags.outputFormat);
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
      'environment',
      'show-values',
      'production',
      'output-format',
    ]),
  },
};

function optionBuilder(yargs: Argv<any>): Argv<EnvListFlags> {
  yargs = Object.keys(cliInfo.options).reduce((yargs, name) => {
    return yargs.option(name, cliInfo.options[name]);
  }, yargs);

  return yargs;
}

export const command = ['list'];
export const describe =
  'Lists all environment variables for a given environment';
export const builder = optionBuilder;
