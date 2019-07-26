import {
  DeployLocalProjectConfig,
  TwilioServerlessApiClient,
} from '@twilio-labs/serverless-api';
import chalk from 'chalk';
import { stripIndent } from 'common-tags';
import debug from 'debug';
import ora, { Ora } from 'ora';
import path from 'path';
import { Argv } from 'yargs';
import { checkConfigForCredentials } from '../checks/check-credentials';
import checkProjectStructure from '../checks/project-structure';
import { DeployCliFlags, getConfigFromFlags } from '../config/deploy';
import { printConfigInfo, printDeployedResources } from '../printers/deploy';
import { errorMessage } from '../printers/utils';
import {
  ApiErrorResponse,
  HttpError,
  saveLatestDeploymentData,
} from '../serverless-api/utils';
import { ExternalCliOptions, sharedCliOptions } from './shared';
import { CliInfo } from './types';
import { constructCommandName, getFullCommand } from './utils';

const log = debug('twilio-run:deploy');

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

export async function handler(
  flags: DeployCliFlags,
  externalCliOptions?: ExternalCliOptions
): Promise<void> {
  const cwd = flags.cwd ? path.resolve(flags.cwd) : process.cwd();
  flags.cwd = cwd;
  const command = getFullCommand(flags);
  await checkProjectStructure(cwd, command, true);

  let config: DeployLocalProjectConfig;
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
    await saveLatestDeploymentData(
      config.cwd,
      serviceSid,
      buildSid,
      config.accountSid.startsWith('AC')
        ? config.accountSid
        : externalCliOptions && externalCliOptions.accountSid
    );
  } catch (err) {
    handleError(err, spinner, flags, config);
  }
}

export const cliInfo: CliInfo = {
  options: {
    ...sharedCliOptions,
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
      describe: 'DEPRECATED: Use --environment instead',
      hidden: true,
    },
    environment: {
      type: 'string',
      describe:
        'The environment name (domain suffix) you want to use for your deployment',
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
      '$0 deploy --environment=prod',
      'Creates an environment with the domain suffix "prod"'
    );

  yargs = Object.keys(cliInfo.options).reduce((yargs, name) => {
    return yargs.option(name, cliInfo.options[name]);
  }, yargs);

  return yargs;
}

export const command = ['deploy'];
export const describe = 'Deploys existing functions and assets to Twilio';
export const builder = optionBuilder;
