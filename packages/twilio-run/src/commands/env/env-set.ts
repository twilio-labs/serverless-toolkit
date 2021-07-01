import { TwilioServerlessApiClient } from '@twilio-labs/serverless-api';
import { Argv } from 'yargs';
import { checkConfigForCredentials } from '../../checks/check-credentials';
import checkForValidServiceSid from '../../checks/check-service-sid';
import checkLegacyConfig from '../../checks/legacy-config';
import {
  EnvSetConfig,
  EnvSetFlags,
  getConfigFromFlags,
} from '../../config/env/env-set';
import {
  BASE_API_FLAG_NAMES,
  BASE_CLI_FLAG_NAMES,
  getRelevantFlags,
} from '../../flags';
import {
  getDebugFunction,
  logApiError,
  logger,
  setLogLevelByName,
} from '../../utils/logger';
import { ExternalCliOptions } from '../shared';
import { CliInfo } from '../types';
import { getFullCommand } from '../utils';

const debug = getDebugFunction('twilio-run:env:unset');

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
  flags: EnvSetFlags,
  externalCliOptions?: ExternalCliOptions
) {
  setLogLevelByName(flags.logLevel);

  await checkLegacyConfig(flags.cwd, false);

  let config: EnvSetConfig;
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
    await client.setEnvironmentVariables(config);
    logger.info(`${flags.key} has been set`);
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
      'key',
      'value',
      'production',
    ]),
  },
};

function optionBuilder(yargs: Argv<any>): Argv<any> {
  yargs = Object.keys(cliInfo.options).reduce((yargs, name) => {
    return yargs.option(name, cliInfo.options[name]);
  }, yargs);

  return yargs;
}

export const command = ['set'];
export const describe =
  'Sets an environment variable with a given key and value';
export const builder = optionBuilder;
