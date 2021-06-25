import { TwilioServerlessApiClient } from '@twilio-labs/serverless-api';
import { Argv } from 'yargs';
import { checkConfigForCredentials } from '../../checks/check-credentials';
import checkForValidServiceSid from '../../checks/check-service-sid';
import checkLegacyConfig from '../../checks/legacy-config';
import {
  EnvGetConfig,
  EnvGetFlags,
  getConfigFromFlags,
} from '../../config/env/env-get';
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
import { writeOutput } from '../../utils/output';
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
  flags: EnvGetFlags,
  externalCliOptions?: ExternalCliOptions
) {
  setLogLevelByName(flags.logLevel);

  await checkLegacyConfig(flags.cwd, false);

  let config: EnvGetConfig;
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

    const resultVariable = result.variables[0];
    if (!resultVariable) {
      throw new Error(
        `Could not find environment variable with name ${flags.key} for service "${result.serviceSid}" and environment "${result.environmentSid}".`
      );
    } else {
      writeOutput(resultVariable.value);
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
      'environment',
      'key',
      'production',
    ]),
  },
};

function optionBuilder(yargs: Argv<any>): Argv<EnvGetFlags> {
  yargs = Object.keys(cliInfo.options).reduce((yargs, name) => {
    return yargs.option(name, cliInfo.options[name]);
  }, yargs);

  return yargs;
}

export const command = ['get'];
export const describe =
  'Retrieves the value of a specific environment variable';
export const builder = optionBuilder;
