import {
  DeployLocalProjectConfig,
  TwilioServerlessApiClient,
} from '@twilio-labs/serverless-api';
import chalk from 'chalk';
import { stripIndent } from 'common-tags';
import debug from 'debug';
import dotenv from 'dotenv';
import ora, { Ora } from 'ora';
import path from 'path';
import { Arguments, Argv } from 'yargs';
import { checkConfigForCredentials } from '../checks/check-credentials';
import checkProjectStructure from '../checks/project-structure';
import { printConfigInfo, printDeployedResources } from '../printers/deploy';
import { errorMessage } from '../printers/utils';
import {
  ApiErrorResponse,
  getFunctionServiceSid,
  HttpError,
  saveLatestDeploymentData,
} from '../serverless-api/utils';
import { EnvironmentVariablesWithAuth } from '../types/generic';
import { fileExists, readFile } from '../utils/fs';
import { CliInfo } from './types';
import {
  constructCommandName,
  deprecateProjectName,
  getFullCommand,
} from './utils';

const log = debug('twilio-run:deploy');

export type DeployCliFlags = Arguments<{
  cwd?: string;
  serviceSid?: string;
  functionsEnv: string;
  projectName?: string;
  serviceName?: string;
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

  let accountSid = '';
  let authToken = '';
  let localEnv: EnvironmentVariablesWithAuth = {};

  const envPath = path.resolve(cwd, flags.env || '.env');

  if (await fileExists(envPath)) {
    const contentEnvFile = await readFile(envPath, 'utf8');
    localEnv = dotenv.parse(contentEnvFile);

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
  } else if (flags.env) {
    throw new Error(`Failed to find .env file at "${envPath}"`);
  }

  const serviceSid = flags.serviceSid || (await getFunctionServiceSid(cwd));

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
    const val = env[key];
    if (typeof val === 'string' && val.length === 0) {
      delete env[key];
    }
  }

  delete env.ACCOUNT_SID;
  delete env.AUTH_TOKEN;

  let serviceName: string | undefined = flags.serviceName || pkgJson.name;
  if (typeof flags.projectName !== 'undefined') {
    deprecateProjectName();
    if (!serviceName) {
      serviceName = flags.projectName;
    }
  }

  if (!serviceName) {
    throw new Error(
      'Please pass --service-name or add a "name" field to your package.json'
    );
  }

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
    serviceName,
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
  flags: DeployCliFlags,
  config: DeployLocalProjectConfig
) {
  log('%O', err);
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
      - Deploy to the existing service with the name "${(err as any)[
        'serviceName'
      ] || config.serviceName}"
        > ${constructCommandName(fullCommand, 'deploy', [
          '--override-existing-project',
        ])}
      - Run deployment in force mode
        > ${constructCommandName(fullCommand, 'deploy', ['--force'])} 
    `;
    console.error(errorMessage(err.message, messageBody));
  } else if (err.name === 'HTTPError') {
    const responseBody = JSON.parse(
      (err as HttpError).body
    ) as ApiErrorResponse;
    const messageBody = stripIndent`
      ${responseBody.message}

      More info: ${responseBody.more_info}
    `;
    console.error(errorMessage('', messageBody));
  } else {
    console.error(err.message);
  }
  process.exit(1);
}

export async function handler(flags: DeployCliFlags): Promise<void> {
  const cwd = flags.cwd ? path.resolve(flags.cwd) : process.cwd();
  flags.cwd = cwd;
  const command = getFullCommand(flags);
  await checkProjectStructure(cwd, command, true);

  let config: DeployLocalProjectConfig;
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

  log('Deploy Config %P', config);

  checkConfigForCredentials(config);

  printConfigInfo(config);

  const spinner = ora('Deploying Function').start();
  try {
    const client = new TwilioServerlessApiClient(config);
    client.on('status-update', evt => {
      spinner.text = evt.message + '\n';
    });
    const result = await client.deployLocalProject(config);
    spinner.text = 'Serverless project successfully deployed\n';
    spinner.succeed();
    printDeployedResources(config, result);
    const { serviceSid, buildSid } = result;
    await saveLatestDeploymentData(config.cwd, serviceSid, buildSid);
  } catch (err) {
    handleError(err, spinner, flags, config);
  }
}

export const cliInfo: CliInfo = {
  options: {
    cwd: {
      type: 'string',
      describe: 'Sets the directory from which to deploy',
    },
    'service-sid': {
      type: 'string',
      describe: 'SID of the Twilio Serverless service you want to deploy to.',
      hidden: true,
    },
    'functions-env': {
      type: 'string',
      describe: 'The environment name you want to use',
      default: 'dev',
    },
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
        'Deploys Serverless project to existing service if a naming conflict has been found.',
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
