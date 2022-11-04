import { TwilioServerlessApiClient } from '@twilio-labs/serverless-api';
import { stripIndent } from 'common-tags';
import { Ora } from 'ora';
import path from 'path';
import { Argv } from 'yargs';
import { checkConfigForCredentials } from '../checks/check-credentials';
import { checkForValidRuntimeHandlerVersion } from '../checks/check-runtime-handler';
import checkLegacyConfig from '../checks/legacy-config';
import checkProjectStructure from '../checks/project-structure';
import {
  DeployCliFlags,
  DeployLocalProjectConfig,
  getConfigFromFlags,
} from '../config/deploy';
import {
  ALL_FLAGS,
  BASE_API_FLAG_NAMES,
  BASE_CLI_FLAG_NAMES,
  getRelevantFlags,
} from '../flags';
import { printConfigInfo, printDeployedResources } from '../printers/deploy';
import { HttpError, saveLatestDeploymentData } from '../serverless-api/utils';
import {
  getDebugFunction,
  getOraSpinner,
  logApiError,
  logger,
  setLogLevelByName,
} from '../utils/logger';
import { ExternalCliOptions } from './shared';
import { CliInfo } from './types';
import { constructCommandName, getFullCommand } from './utils';

const debug = getDebugFunction('twilio-run:deploy');

function logError(msg: string) {
  logger.error(msg);
}

function handleError(
  err: Error | HttpError,
  spinner: Ora,
  flags: DeployCliFlags,
  config: DeployLocalProjectConfig
) {
  debug('%O', err);
  spinner.fail('Failed Deployment');
  if (err.name === 'conflicting-servicename') {
    const fullCommand = getFullCommand(flags);
    const messageBody = stripIndent`
      Here are a few ways to solve this problem:

      - Rename your project in the package.json "name" property
      - Pass an explicit name to your deployment
        > ${constructCommandName(fullCommand, 'deploy', [
          '-n',
          'my-new-service-name',
        ])}
      - Deploy to the existing service with the name "${
        (err as any)['serviceName'] || config.serviceName
      }"
        > ${constructCommandName(fullCommand, 'deploy', [
          '--override-existing-project',
        ])}
      - Run deployment in force mode
        > ${constructCommandName(fullCommand, 'deploy', ['--force'])}
    `;
    logger.error(messageBody, err.message);
  } else if (err.name === 'TwilioApiError') {
    logApiError(logger, err);
  } else {
    logger.error(err.message);
  }
  process.exit(1);
}

export async function handler(
  flags: DeployCliFlags,
  externalCliOptions?: ExternalCliOptions
): Promise<void> {
  setLogLevelByName(flags.logLevel);

  const cwd = flags.cwd ? path.resolve(flags.cwd) : process.cwd();
  flags.cwd = cwd;
  const continueWork = await checkLegacyConfig(cwd);
  if (!continueWork) {
    process.exit(1);
  }

  const command = getFullCommand(flags);
  await checkProjectStructure(cwd, command, true);

  let config: DeployLocalProjectConfig;
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

  if (!checkForValidRuntimeHandlerVersion(config.pkgJson)) {
    process.exit(1);
    return;
  }

  debug('Deploy Config %P', config);

  checkConfigForCredentials(config);

  printConfigInfo(config, config.outputFormat);

  const spinner = getOraSpinner('Deploying Function').start();
  try {
    const client = new TwilioServerlessApiClient(config);
    client.on('status-update', (evt) => {
      spinner.text = evt.message + '\n';
    });
    const result = await client.deployLocalProject(config);
    spinner.text = 'Serverless project successfully deployed\n';
    spinner.succeed();
    printDeployedResources(config, result, config.outputFormat);
    const { serviceSid, buildSid } = result;
    await saveLatestDeploymentData(
      config.cwd,
      serviceSid,
      buildSid,
      config.username.startsWith('AC')
        ? config.username
        : externalCliOptions && externalCliOptions.accountSid,
      config.region
    );
  } catch (err) {
    handleError(err, spinner, flags, config);
  }
}

export const cliInfo: CliInfo = {
  options: {
    ...getRelevantFlags([
      ...BASE_CLI_FLAG_NAMES,
      ...BASE_API_FLAG_NAMES,
      'service-sid',
      'environment',
      'service-name',
      'override-existing-project',
      'force',
      'functions',
      'assets',
      'assets-folder',
      'functions-folder',
      'runtime',
      'output-format',
    ]),
    production: {
      ...ALL_FLAGS['production'],
      describe:
        'Please prefer the "activate" command! Deploys to the production environment (no domain suffix). Overrides the value passed via the environment flag.',
      default: false,
    },
  },
};

function optionBuilder(yargs: Argv<any>): Argv<DeployCliFlags> {
  yargs = yargs
    .example(
      '$0 deploy',
      'Deploys all functions and assets in the current working directory'
    )
    .example(
      '$0 deploy --environment=stage',
      'Creates an environment with the domain suffix "stage"'
    );

  yargs = Object.keys(cliInfo.options).reduce((yargs, name) => {
    return yargs.option(name, cliInfo.options[name]);
  }, yargs);

  return yargs;
}

export const command = ['deploy'];
export const describe = 'Deploys existing functions and assets to Twilio';
export const builder = optionBuilder;
