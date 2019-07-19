import {
  ActivateConfig as ApiActivateConfig,
  TwilioServerlessApiClient,
} from '@twilio-labs/serverless-api';
import chalk from 'chalk';
import debug from 'debug';
import dotenv from 'dotenv';
import ora, { Ora } from 'ora';
import path from 'path';
import { Arguments, Argv } from 'yargs';
import { checkConfigForCredentials } from '../checks/check-credentials';
import checkForValidServiceSid from '../checks/check-service-sid';
import { getFunctionServiceSid } from '../serverless-api/utils';
import { fileExists, readFile } from '../utils/fs';
import { CliInfo } from './types';
import { getFullCommand } from './utils';

const log = debug('twilio-run:activate');

type ActivateConfig = ApiActivateConfig & {
  cwd: string;
  accountSid?: string;
  authToken?: string;
};

export type ActivateCliFlags = Arguments<{
  cwd?: string;
  serviceSid?: string;
  buildSid?: string;
  sourceEnvironment?: string;
  environment: string;
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
  let { accountSid: rawAccountSid, authToken: rawAuthToken } = flags;

  let accountSid = '';
  if (typeof rawAccountSid === 'string') {
    accountSid = rawAccountSid;
  }

  let authToken = '';
  if (typeof rawAuthToken === 'string') {
    authToken = rawAuthToken;
  }

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
      accountSid ||
      localEnv.ACCOUNT_SID ||
      (flags._cliDefault && flags._cliDefault.username) ||
      '';
    authToken =
      authToken ||
      localEnv.AUTH_TOKEN ||
      (flags._cliDefault && flags._cliDefault.password) ||
      '';
  }

  const readServiceSid = flags.serviceSid || (await getFunctionServiceSid(cwd));

  const command = getFullCommand(flags);
  const serviceSid = checkForValidServiceSid(command, readServiceSid);

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

export async function handler(flags: ActivateCliFlags): Promise<void> {
  let config: ActivateConfig;
  try {
    config = await getConfigFromFlags(flags);
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
    cwd: {
      type: 'string',
      hidden: true,
      describe:
        'Sets the directory of your existing Serverless project. Defaults to current directory',
    },
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
