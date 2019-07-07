import debug from 'debug';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { PackageJson } from 'type-fest';

import {
  TwilioServerlessApiClient,
  ListConfig as ApiListConfig,
  ListOptions,
} from '@twilio-labs/serverless-api';

import { fileExists, readFile } from '../utils/fs';
import { getFunctionServiceSid } from '../serverless-api/utils';
import { printListResult } from '../printers/list';
import { Arguments, Argv } from 'yargs';

const log = debug('twilio-run:list');

export type ListConfig = ApiListConfig & {
  cwd: string;
  properties?: string[];
  extendedOutput: boolean;
};

export type ListCliFlags = Arguments<{
  types: string;
  projectName?: string;
  properties?: string;
  extendedOutput: boolean;
  cwd?: string;
  environment?: string;
  accountSid?: string;
  authToken?: string;
  serviceSid?: string;
  env?: string;
}> & {
  _cliDefault: {
    username: string;
    password: string;
  };
};

async function getConfigFromFlags(flags: ListCliFlags): Promise<ListConfig> {
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

  const serviceSid = flags.serviceSid || (await getFunctionServiceSid(cwd));

  let projectName = flags.projectName;
  if (!projectName) {
    const pkgJsonPath = path.join(cwd, 'package.json');
    if (await fileExists(pkgJsonPath)) {
      const pkgContent = await readFile(pkgJsonPath, 'utf8');
      const pkgJson: PackageJson = JSON.parse(pkgContent);
      if (typeof pkgJson.name === 'string') {
        projectName = pkgJson.name;
      }
    }
  }

  const types = flags.types.split(',') as ListOptions[];

  return {
    cwd,
    accountSid,
    authToken,
    serviceSid,
    projectName,
    environment: flags.environment,
    properties: flags.properties
      ? flags.properties.split(',').map(x => x.trim())
      : undefined,
    extendedOutput: flags.extendedOutput,
    types,
  };
}

function logError(msg: string) {
  console.error(chalk`{red.bold ERROR} ${msg}`);
}

function handleError(err: Error) {
  log('%O', err);
  logError(err.message);
  process.exit(1);
}

export async function handler(flags: ListCliFlags): Promise<void> {
  let config: ListConfig;
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

  try {
    const client = new TwilioServerlessApiClient(config);
    const result = await client.list({ ...config });
    printListResult(result, config);
  } catch (err) {
    handleError(err);
  }
}

export const cliInfo = {
  argsDefaults: {
    types: 'environments,builds',
  },
  options: {
    'project-name': {
      type: 'string',
      alias: 'n',
      describe:
        'Overrides the name of the project. Default: the name field in your package.json',
    },
    properties: {
      type: 'string',
      describe:
        'Specify the output properties you want to see. Works best on single types',
      hidden: true,
    },
    'extended-output': {
      type: 'boolean',
      describe: 'Show an extended set of properties on the output',
      default: false,
    },
    cwd: {
      type: 'string',
      hidden: true,
      describe:
        'Sets the directory of your existing Functions project. Defaults to current directory',
    },
    environment: {
      type: 'string',
      describe: 'The environment to list variables for',
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
    'service-sid': {
      type: 'string',
      describe: 'Specific Serverless Service SID to run list for',
    },
    env: {
      type: 'string',
      describe:
        'Path to .env file for environment variables that should be installed',
    },
  },
};

function optionBuilder(yargs: Argv<any>): Argv<ListCliFlags> {
  yargs = yargs
    .default('types', 'environments,builds')
    .example(
      '$0 list services',
      'Lists all existing services/projects associated with your Twilio Account'
    )
    .example(
      '$0 ls functions,assets --environment=dev --project-name=demo',
      'Lists all existing functions & assets associated with the `dev` environment of this project'
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
