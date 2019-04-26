const path = require('path');
const chalk = require('chalk');
const dotenv = require('dotenv');
const ora = require('ora');
const log = require('debug')('twilio-run:deploy');
const { stripIndent } = require('common-tags');

const { TwilioServerlessApiClient } = require('@twilio-labs/serverless-api');

const { fileExists, readFile, writeFile } = require('../utils/fs');
const { printDeployedResources } = require('../printers/deploy');
const {
  getFunctionServiceSid,
  saveLatestDeploymentData,
} = require('../serverless-api/utils');

async function getConfigFromFlags(flags) {
  const cwd = flags.cwd ? path.resolve(flags.cwd) : process.cwd();

  const envPath = path.resolve(cwd, flags.env || '.env');
  const pkgJsonPath = path.join(cwd, 'package.json');

  if (!(await fileExists(envPath))) {
    throw new Error('Failed to find .env file');
  }

  const contentEnvFile = await readFile(envPath, 'utf8');
  const localEnv = dotenv.parse(contentEnvFile);
  const serviceSid = await getFunctionServiceSid(cwd);

  const accountSid = flags.accountSid || localEnv.ACCOUNT_SID;
  const authToken = flags.authToken || localEnv.AUTH_TOKEN;

  if (!(await fileExists(pkgJsonPath))) {
    throw new Error('Failed to find package.json file');
  }

  const pkgContent = await readFile(pkgJsonPath, 'utf8');
  const pkgJson = JSON.parse(pkgContent);

  const env = {
    ...localEnv,
  };
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
  };
}

function logError(msg) {
  console.error(chalk`{red.bold ERROR} ${msg}`);
}

function printConfigInfo(config) {
  let dependencyString = '';
  if (config.pkgJson && config.pkgJson.dependencies) {
    dependencyString = Object.keys(config.pkgJson.dependencies).join(', ');
  }

  console.log(
    // @ts-ignore
    chalk`
Deploying functions & assets to Twilio Serverless

{bold Account}\t\t${config.accountSid}
{bold Project Name}\t${config.projectName}
{bold Environment}\t${config.functionsEnv}
{bold Root Directory}\t${config.cwd}
{bold Dependencies}\t${dependencyString}
{bold Env Variables}\t${Object.keys(config.env).join(', ')}
`
  );
}

function handleError(err, spinner, flags) {
  log('%O', err);
  if (err.name === 'conflicting-servicename') {
    spinner.fail(err.message);
    console.log(stripIndent`
      Here are a few ways to solve this problem:
      - Rename your project in the package.json "name" property
      - Pass an explicit name to your deployment
        > ${flags.$0} deploy -n my-new-service-name
      - Deploy to the existing service with the name "${err.projectName}"
        > ${flags.$0} deploy --override-existing-project
      - Run deployment in force mode
        > ${flags.$0} deploy --force
    `);
  } else if (err.name === 'HTTPError') {
    spinner.fail(err.body.message);
  } else {
    spinner.fail(err.message);
  }
  process.exit(1);
}

async function handler(flags) {
  let config;
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

function optionBuilder(yargs) {
  return yargs
    .example(
      '$0 deploy',
      'Deploys all functions and assets in the current working directory'
    )
    .example(
      '$0 deploy --functions-env=dev',
      'Creates a specifically named environment'
    )
    .option('cwd', {
      type: 'string',
      describe: 'Sets the directory from which to deploy',
    })
    .option('functions-env', {
      type: 'string',
      describe: 'The environment name you want to use',
      default: 'dev',
    })
    .option('projectName', {
      type: 'string',
      alias: 'n',
      describe:
        'Overrides the name of the project. Default: the name field in your package.json',
    })
    .option('accountSid', {
      type: 'string',
      alias: 'u',
      describe:
        'A specific account SID to be used for deployment. Uses fields in .env otherwise',
    })
    .option('authToken', {
      type: 'string',
      alias: 'p',
      describe:
        'Use a specific auth token for deployment. Uses fields from .env otherwise',
    })
    .option('env', {
      type: 'string',
      describe:
        'Path to .env file. If none, the local .env in the current working directory is used.',
    })
    .option('override-existing-project', {
      type: 'boolean',
      describe:
        'Deploys project to existing service if a naming conflict has been found.',
      default: false,
    })
    .option('force', {
      type: 'boolean',
      describe: 'Will run deployment in force mode. Can be dangerous.',
      default: false,
    });
}

module.exports = {
  command: ['deploy'],
  describe: 'Deploys existing functions and assets to Twilio',
  builder: optionBuilder,
  handler,
};
