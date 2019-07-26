import {
  ActivateConfig,
  TwilioServerlessApiClient,
} from '@twilio-labs/serverless-api';
import chalk from 'chalk';
import debug from 'debug';
import ora, { Ora } from 'ora';
import { Argv } from 'yargs';
import { checkConfigForCredentials } from '../checks/check-credentials';
import { ActivateCliFlags, getConfigFromFlags } from '../config/activate';
import { ExternalCliOptions, sharedCliOptions } from './shared';
import { CliInfo } from './types';

const log = debug('twilio-run:activate');

function logError(msg: string) {
  console.error(chalk`{red.bold ERROR} ${msg}`);
}

function handleError(err: Error, spinner: Ora) {
  log('%O', err);
  if (spinner) {
    spinner.fail(err.message);
  }
  process.exit(1);
}

export async function handler(
  flags: ActivateCliFlags,
  externalCliOptions?: ExternalCliOptions
): Promise<void> {
  let config: ActivateConfig;
  try {
    config = await getConfigFromFlags(flags, externalCliOptions);
  } catch (err) {
    log(err);
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

  const details = config.buildSid
    ? `(${config.buildSid})`
    : `from ${config.sourceEnvironment}`;
  const spinner = ora(
    `Activating build ${details} to ${config.targetEnvironment}`
  ).start();
  try {
    const client = new TwilioServerlessApiClient(config);
    const result = await client.activateBuild(config);
    spinner.succeed(
      `Activated new build ${details} on ${config.targetEnvironment}`
    );
    console.log(result.domain);
  } catch (err) {
    handleError(err, spinner);
  }
}

export const cliInfo: CliInfo = {
  options: {
    ...sharedCliOptions,
    'service-sid': {
      type: 'string',
      describe: 'SID of the Twilio Serverless Service to deploy to',
    },
    'build-sid': {
      type: 'string',
      describe: 'An existing Build SID to deploy to the new environment',
    },
    'source-environment': {
      type: 'string',
      describe:
        'SID or suffix of an existing environment you want to deploy from.',
    },
    environment: {
      type: 'string',
      describe: 'The environment suffix or SID to deploy to.',
      required: true,
    },
    'account-sid': {
      type: 'string',
      alias: 'u',
      describe:
        'A specific account SID to be used for deployment. Uses fields in .env otherwise',
    },
    'auth-token': {
      type: 'string',
      describe:
        'Use a specific auth token for deployment. Uses fields from .env otherwise',
    },
    'create-environment': {
      type: 'boolean',
      describe: "Creates environment if it couldn't find it.",
      default: false,
    },
    force: {
      type: 'boolean',
      describe: 'Will run deployment in force mode. Can be dangerous.',
      default: false,
    },
    env: {
      type: 'string',
      describe:
        'Path to .env file for environment variables that should be installed',
    },
  },
};

function optionBuilder<T>(yargs: Argv<any>): Argv<ActivateCliFlags> {
  yargs = yargs
    .example(
      '$0 activate --environment=prod --source-environment=dev  ',
      'Promotes the same build that is on the "dev" environment to the "prod" environment'
    )
    .example(
      '$0 activate --environment=demo --create-environment --build-sid=ZB1234xxxxxxxxxx',
      'Duplicates an existing build to a new environment called `demo`'
    );

  yargs = Object.keys(cliInfo.options).reduce((yargs, name) => {
    return yargs.option(name, cliInfo.options[name]);
  }, yargs);

  return yargs;
}

export const command = ['activate', 'promote'];
export const describe = 'Promotes an existing deployment to a new environment';
export const builder = optionBuilder;
