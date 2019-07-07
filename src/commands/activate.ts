import debug from 'debug';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import ora, { Ora } from 'ora';
import { Argv, Arguments } from 'yargs';

import {
  TwilioServerlessApiClient,
  ActivateConfig as ApiActivateConfig,
} from '@twilio-labs/serverless-api';

import { fileExists, readFile } from '../utils/fs';
import { getFunctionServiceSid } from '../serverless-api/utils';

const log = debug('twilio-run:activate');

type ActivateConfig = ApiActivateConfig & {
  cwd: string;
};

export type ActivateCliFlags = Arguments<{
  cwd?: string;
  buildSid?: string;
  sourceEnvironment?: string;
  environment: string;
  accountSid?: string;
  authToken?: string;
  createEnvironment: boolean;
  force: boolean;
  env?: string;
}> & {
  _cliDefault?: {
    username: string;
    password: string;
  };
};

async function getConfigFromFlags(
  flags: ActivateCliFlags
): Promise<ActivateConfig> {
  const cwd = flags.cwd ? path.resolve(flags.cwd) : process.cwd();
  let { accountSid, authToken } = flags;

  if (!accountSid || !authToken) {
    const envPath = path.resolve(cwd, flags.env || '.env');
    let contentEnvFile;
    if (!(await fileExists(envPath))) {
      contentEnvFile = '';
    } else {
      contentEnvFile = await readFile(envPath, 'utf8');
    }

    const localEnv = dotenv.parse(contentEnvFile);
    accountSid =
      flags.accountSid || localEnv.ACCOUNT_SID || flags._cliDefault.username;
    authToken =
      flags.authToken || localEnv.AUTH_TOKEN || flags._cliDefault.password;
  }

  const serviceSid = await getFunctionServiceSid(cwd);

  return {
    cwd,
    accountSid,
    authToken,
    serviceSid,
    force: flags.force,
    createEnvironment: flags.createEnvironment,
    buildSid: flags.buildSid,
    targetEnvironment: flags.environment,
    sourceEnvironment: flags.sourceEnvironment,
  };
}

function logError(msg) {
  console.error(chalk`{red.bold ERROR} ${msg}`);
}

function handleError(err: Error, spinner: Ora) {
  log('%O', err);
  if (spinner) {
    spinner.fail(err.message);
  }
  process.exit(1);
}

export async function handler(flags: ActivateCliFlags) {
  let config: ActivateConfig;
  try {
    config = await getConfigFromFlags(flags);
  } catch (err) {
    log(err);
    logError(err.message);
    process.exit(1);
  }

  if (!config) {
    logError('Internal Error');
    process.exit(1);
  }

  if (!config.accountSid || !config.authToken) {
    logError(
      'Please enter ACCOUNT_SID and AUTH_TOKEN in your .env file or specify them via the command-line.'
    );
    process.exit(1);
  }

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
  } catch (err) {
    handleError(err, spinner);
  }
}

export const cliInfo = {
  options: {
    cwd: {
      type: 'string',
      hidden: true,
      describe:
        'Sets the directory of your existing Functions project. Defaults to current directory',
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
