import debug from 'debug';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import ora, { Ora } from 'ora';
import { stripIndent } from 'common-tags';
import { Argv, Arguments } from 'yargs';

import {
  TwilioServerlessApiClient,
  DeployLocalProjectConfig,
} from '@twilio-labs/serverless-api';

import { fileExists, readFile } from '../utils/fs';
import { printDeployedResources, printConfigInfo } from '../printers/deploy';
import {
  getFunctionServiceSid,
  saveLatestDeploymentData,
  HttpError,
} from '../serverless-api/utils';
import { EnvironmentVariablesWithAuth } from '../types/generic';

const log = debug('twilio-run:deploy');

export type DeployCliFlags = Arguments<{
  cwd?: string;
  functionsEnv: string;
  projectName?: string;
  accountSid?: string;
  authToken?: string;
  env?: string;
  overrideExistingProject: boolean;
  force: boolean;
  functions: boolean;
  assets: boolean;
  assetsFolder?: string;
  functionsFolder?: string;
}> & {
  _cliDefault?: {
    username: string;
    password: string;
  };
};

async function getConfigFromFlags(
  flags: DeployCliFlags
): Promise<DeployLocalProjectConfig> {
  const cwd = flags.cwd ? path.resolve(flags.cwd) : process.cwd();

  let { accountSid, authToken } = flags;
  let localEnv: EnvironmentVariablesWithAuth = {};

  const envPath = path.resolve(cwd, flags.env || '.env');

  if (await fileExists(envPath)) {
    const contentEnvFile = await readFile(envPath, 'utf8');
    localEnv = dotenv.parse(contentEnvFile);

    accountSid =
      flags.accountSid || localEnv.ACCOUNT_SID || flags._cliDefault.username;
    authToken =
      flags.authToken || localEnv.AUTH_TOKEN || flags._cliDefault.password;
  } else if (flags.env) {
    throw new Error(`Failed to find .env file at "${envPath}"`);
  }

  const serviceSid = await getFunctionServiceSid(cwd);

  const pkgJsonPath = path.join(cwd, 'package.json');
  if (!(await fileExists(pkgJsonPath))) {
    throw new Error('Failed to find package.json file');
  }

  const pkgContent = await readFile(pkgJsonPath, 'utf8');
  const pkgJson = JSON.parse(pkgContent);

  const env = {
    ...localEnv,
  };

  for (let key of Object.keys(env)) {
    if (typeof env[key] === 'string' && env[key].length === 0) {
      delete env[key];
    }
  }

  delete env.ACCOUNT_SID;
  delete env.AUTH_TOKEN;

  return {
    cwd,
    envPath,
    accountSid,
    authToken,
    env,
    serviceSid,
    pkgJson,
    overrideExistingService: flags.overrideExistingProject,
    force: flags.force,
    projectName: flags.projectName || pkgJson.name,
    functionsEnv: flags.functionsEnv,
    functionsFolderName: flags.functionsFolder,
    assetsFolderName: flags.assetsFolder,
    noAssets: !flags.assets,
    noFunctions: !flags.functions,
  };
}

function logError(msg: string) {
  console.error(chalk`{red.bold ERROR} ${msg}`);
}

function handleError(
  err: Error | HttpError,
  spinner: Ora,
  flags: DeployCliFlags
) {
  log('%O', err);
  if (err.name === 'conflicting-servicename') {
    spinner.fail(err.message);
    console.log(stripIndent`
      Here are a few ways to solve this problem:
      - Rename your project in the package.json "name" property
      - Pass an explicit name to your deployment
        > ${flags.$0} deploy -n my-new-service-name
      - Deploy to the existing service with the name "${flags.projectName}"
        > ${flags.$0} deploy --override-existing-project
      - Run deployment in force mode
        > ${flags.$0} deploy --force
    `);
  } else if (err.name === 'HTTPError') {
    spinner.fail((err as HttpError).body.message);
  } else {
    spinner.fail(err.message);
  }
  process.exit(1);
}

export async function handler(flags: DeployCliFlags): Promise<void> {
  let config: DeployLocalProjectConfig;
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

  log('Deploy Config %O', config);

  if (!config.accountSid || !config.authToken) {
    logError(
      'Please enter ACCOUNT_SID and AUTH_TOKEN in your .env file or specify them via the command-line.'
    );
    process.exit(1);
  }

  printConfigInfo(config);

  const spinner = ora('Deploying Function').start();
  try {
    const client = new TwilioServerlessApiClient(config);
    client.on('status-update', evt => {
      spinner.text = evt.message + '\n';
    });
    const result = await client.deployLocalProject(config);
    spinner.text = 'Project successfully deployed\n';
    spinner.succeed();
    printDeployedResources(config, result);
    const { serviceSid, buildSid } = result;
    await saveLatestDeploymentData(config.cwd, serviceSid, buildSid);
  } catch (err) {
    handleError(err, spinner, flags);
  }
}

export const cliInfo = {
  options: {
    cwd: {
      type: 'string',
      describe: 'Sets the directory from which to deploy',
    },
    'functions-env': {
      type: 'string',
      describe: 'The environment name you want to use',
      default: 'dev',
    },
    'project-name': {
      type: 'string',
      alias: 'n',
      describe:
        'Overrides the name of the project. Default: the name field in your package.json',
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
    env: {
      type: 'string',
      describe:
        'Path to .env file. If none, the local .env in the current working directory is used.',
    },
    'override-existing-project': {
      type: 'boolean',
      describe:
        'Deploys project to existing service if a naming conflict has been found.',
      default: false,
    },
    force: {
      type: 'boolean',
      describe: 'Will run deployment in force mode. Can be dangerous.',
      default: false,
    },
    functions: {
      type: 'boolean',
      describe: 'Upload functions. Can be turned off with --no-functions',
      default: true,
    },
    assets: {
      type: 'boolean',
      describe: 'Upload assets. Can be turned off with --no-assets',
      default: true,
    },
    'assets-folder': {
      type: 'string',
      describe: 'Specific folder name to be used for static assets',
    },
    'functions-folder': {
      type: 'string',
      describe: 'Specific folder name to be used for static functions',
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
      '$0 deploy --functions-env=dev',
      'Creates a specifically named environment'
    );

  yargs = Object.keys(cliInfo.options).reduce((yargs, name) => {
    return yargs.option(name, cliInfo.options[name]);
  }, yargs);

  return yargs;
}

export const command = ['deploy'];
export const describe = 'Deploys existing functions and assets to Twilio';
export const builder = optionBuilder;
