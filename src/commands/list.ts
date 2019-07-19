import {
  ListConfig as ApiListConfig,
  ListOptions,
  TwilioServerlessApiClient,
} from '@twilio-labs/serverless-api';
import chalk from 'chalk';
import debug from 'debug';
import dotenv from 'dotenv';
import path from 'path';
import { PackageJson } from 'type-fest';
import { Arguments, Argv } from 'yargs';
import { checkConfigForCredentials } from '../checks/check-credentials';
import checkForValidServiceSid from '../checks/check-service-sid';
import { printListResult } from '../printers/list';
import { getFunctionServiceSid } from '../serverless-api/utils';
import { fileExists, readFile } from '../utils/fs';
import { CliInfo } from './types';
import { deprecateProjectName, getFullCommand } from './utils';

const log = debug('twilio-run:list');

export type ListConfig = ApiListConfig & {
  cwd: string;
  properties?: string[];
  extendedOutput: boolean;
};

export type ListCliFlags = Arguments<{
  types: string;
  projectName?: string;
  serviceName?: string;
  properties?: string;
  extendedOutput: boolean;
  cwd?: string;
  environment?: string;
  accountSid?: string;
  authToken?: string;
  serviceSid?: string;
  env?: string;
}> & {
  _cliDefault?: {
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
      flags.accountSid ||
      localEnv.ACCOUNT_SID ||
      (flags._cliDefault && flags._cliDefault.username) ||
      '';
    authToken =
      flags.authToken ||
      localEnv.AUTH_TOKEN ||
      (flags._cliDefault && flags._cliDefault.password) ||
      '';
  }

  const serviceSid = flags.serviceSid || (await getFunctionServiceSid(cwd));

  let serviceName = flags.serviceName;

  if (typeof flags.projectName !== 'undefined') {
    deprecateProjectName();
    if (!serviceName) {
      serviceName = flags.projectName;
    }
  }

  if (!serviceName) {
    const pkgJsonPath = path.join(cwd, 'package.json');
    if (await fileExists(pkgJsonPath)) {
      const pkgContent = await readFile(pkgJsonPath, 'utf8');
      const pkgJson: PackageJson = JSON.parse(pkgContent);
      if (typeof pkgJson.name === 'string') {
        serviceName = pkgJson.name;
      }
    }
  }

  const types = flags.types.split(',') as ListOptions[];

  return {
    cwd,
    accountSid,
    authToken,
    serviceSid,
    serviceName,
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
    return;
  }

  if (!config) {
    logError('Internal Error');
    process.exit(1);
    return;
  }

  checkConfigForCredentials(config);

  if (config.types !== 'services' && config.types[0] !== 'services') {
    const command = getFullCommand(flags);
    checkForValidServiceSid(command, config.serviceSid);
  }

  try {
    const client = new TwilioServerlessApiClient(config);
    const result = await client.list({ ...config });
    printListResult(result, config);
  } catch (err) {
    handleError(err);
  }
}

export const cliInfo: CliInfo = {
  argsDefaults: {
    types: 'services',
  },
  options: {
    'service-name': {
      type: 'string',
      alias: 'n',
      describe:
        'Overrides the name of the Serverless project. Default: the name field in your package.json',
    },
    'project-name': {
      type: 'string',
      hidden: true,
      describe:
        'DEPRECATED: Overrides the name of the project. Default: the name field in your package.json',
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
        'Sets the directory of your existing Serverless project. Defaults to current directory',
    },
    environment: {
      type: 'string',
      describe: 'The environment to list variables for',
      default: 'dev',
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
  if (cliInfo.argsDefaults) {
    yargs = Object.keys(cliInfo.argsDefaults).reduce(
      (yargs: Argv<any>, name: string) => {
        if (cliInfo.argsDefaults && cliInfo.argsDefaults[name]) {
          return yargs.default(name, cliInfo.argsDefaults[name]);
        }
        return yargs;
      },
      yargs
    );
  }

  yargs = yargs
    .example(
      '$0 list services',
      'Lists all existing services/projects associated with your Twilio Account'
    )
    .example(
      '$0 ls functions,assets --environment=dev --service-name=demo',
      'Lists all existing functions & assets associated with the `dev` environment of this service/project'
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
