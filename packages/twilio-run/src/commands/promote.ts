import { TwilioServerlessApiClient } from '@twilio-labs/serverless-api';
import { ClientApiError } from '@twilio-labs/serverless-api/dist/utils/error';
import { Ora } from 'ora';
import { Argv } from 'yargs';
import { checkConfigForCredentials } from '../checks/check-credentials';
import checkLegacyConfig from '../checks/legacy-config';
import {
  getConfigFromFlags,
  PromoteCliFlags,
  PromoteConfig,
} from '../config/promote';
import {
  BASE_API_FLAG_NAMES,
  BASE_CLI_FLAG_NAMES,
  getRelevantFlags,
} from '../flags';
import { printActivateConfig, printActivateResult } from '../printers/activate';
import {
  getDebugFunction,
  getOraSpinner,
  logApiError,
  logger,
  setLogLevelByName,
} from '../utils/logger';
import { ExternalCliOptions } from './shared';
import { CliInfo } from './types';

const debug = getDebugFunction('twilio-run:promote');

function logError(msg: string) {
  logger.error(msg);
}

function handleError(err: Error, spinner: Ora) {
  debug('%O', err);
  if (spinner) {
    if (err.name === 'TwilioApiError') {
      spinner.fail('Failed promoting build.');
      const clientApiError = err as ClientApiError;
      if (clientApiError.code === 20409) {
        clientApiError.message +=
          '\n\nThis is probably because you are trying to promote a build to an environment where it is already live. Try promoting the build to a different environment or choosing a different build to promote to this environment.';
      }
      logApiError(logger, clientApiError);
    } else {
      spinner.fail(err.message);
    }
  }
  process.exit(1);
}

export async function handler(
  flags: PromoteCliFlags,
  externalCliOptions?: ExternalCliOptions
): Promise<void> {
  setLogLevelByName(flags.logLevel);

  const continueWork = await checkLegacyConfig(flags.cwd);
  if (!continueWork) {
    process.exit(1);
  }

  let config: PromoteConfig;
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

  printActivateConfig(config, config.outputFormat);

  const details = config.buildSid
    ? `(${config.buildSid})`
    : `from ${config.sourceEnvironment}`;
  const spinner = getOraSpinner(
    `Activating build ${details} to ${config.targetEnvironment || 'production'}`
  ).start();
  try {
    const client = new TwilioServerlessApiClient(config);
    const result = await client.activateBuild(config);
    spinner.succeed(
      `Activated new build ${details} on ${
        config.targetEnvironment || 'production'
      }`
    );
    printActivateResult(result, config.outputFormat, config.region);
  } catch (err) {
    handleError(err, spinner);
  }
}

export const cliInfo: CliInfo = {
  options: {
    ...getRelevantFlags([
      ...BASE_CLI_FLAG_NAMES,
      ...BASE_API_FLAG_NAMES,
      'service-sid',
      'build-sid',
      'source-environment',
      'environment',
      'production',
      'create-environment',
      'force',
      'env',
      'output-format',
    ]),
  },
};

function optionBuilder<T>(yargs: Argv<any>): Argv<PromoteCliFlags> {
  yargs = yargs
    .example(
      '$0 promote --environment=prod --source-environment=dev  ',
      'Promotes the same build that is on the "dev" environment to the "prod" environment'
    )
    .example(
      '$0 promote --to=prod --from=dev  ',
      'Promotes the same build that is on the "dev" environment to the "prod" environment'
    )
    .example(
      '$0 promote --environment=demo --create-environment --build-sid=ZB1234xxxxxxxxxx',
      'Duplicates an existing build to a new environment called `demo`'
    )
    .example(
      '$0 promote --to=demo --create-environment --from-build=ZB1234xxxxxxxxxx',
      'Duplicates an existing build to a new environment called `demo`'
    );

  yargs = Object.keys(cliInfo.options).reduce((yargs, name) => {
    return yargs.option(name, cliInfo.options[name]);
  }, yargs);

  return yargs;
}

export const command = ['promote', 'activate'];
export const describe = 'Promotes an existing deployment to a new environment';
export const builder = optionBuilder;
