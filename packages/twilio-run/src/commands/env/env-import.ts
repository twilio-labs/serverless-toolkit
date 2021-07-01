import { TwilioServerlessApiClient } from '@twilio-labs/serverless-api';
import { Argv } from 'yargs';
import { checkConfigForCredentials } from '../../checks/check-credentials';
import checkForValidServiceSid from '../../checks/check-service-sid';
import checkLegacyConfig from '../../checks/legacy-config';
import {
  EnvImportConfig,
  EnvImportFlags,
  getConfigFromFlags,
} from '../../config/env/env-import';
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
  flags: EnvImportFlags,
  externalCliOptions?: ExternalCliOptions
) {
  setLogLevelByName(flags.logLevel);

  await checkLegacyConfig(flags.cwd, false);

  let config: EnvImportConfig;
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
    logger.info(`Environment variables updated`);
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
      'env',
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

export const command = ['import'];
export const describe =
  'Takes a .env file and uploads all environment variables to a given environment';
export const builder = optionBuilder;
