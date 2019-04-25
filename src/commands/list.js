const path = require('path');
const chalk = require('chalk');
const dotenv = require('dotenv');
const ora = require('ora');
const log = require('debug')('twilio-run:deploy');
const { stripIndent } = require('common-tags');

const { TwilioServerlessApiClient } = require('@twilio-labs/serverless-api');

const { fileExists, readFile, writeFile } = require('../utils/fs');
const { getFunctionServiceSid } = require('../serverless-api/utils');
const { printListResult } = require('../printers/list');

async function getConfigFromFlags(flags) {
  const cwd = flags.cwd ? path.resolve(flags.cwd) : process.cwd();

  const envPath = path.resolve(cwd, flags.env || '.env');

  let contentEnvFile;
  if (!(await fileExists(envPath))) {
    contentEnvFile = '';
  } else {
    contentEnvFile = await readFile(envPath, 'utf8');
  }

  const localEnv = dotenv.parse(contentEnvFile);
  const serviceSid = await getFunctionServiceSid(cwd);

  const accountSid = flags.accountSid || localEnv.ACCOUNT_SID;
  const authToken = flags.authToken || localEnv.AUTH_TOKEN;

  const pkgJsonPath = path.join(cwd, 'package.json');
  let projectName = flags.projectName;

  if (!projectName) {
    if (!(await fileExists(pkgJsonPath))) {
      throw new Error(
        'Failed to find package.json file or --project-name flag'
      );
    }
    const pkgContent = await readFile(pkgJsonPath, 'utf8');
    const pkgJson = JSON.parse(pkgContent);
    projectName = pkgJson.name;
  }

  return {
    cwd,
    accountSid,
    authToken,
    serviceSid,
    projectName,
    environment: flags.environment,
  };
}

function logError(msg) {
  console.error(chalk`{red.bold ERROR} ${msg}`);
}

function handleError(err) {
  log('%O', err);
  logError(err);
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

  try {
    const client = new TwilioServerlessApiClient(config);
    const types = flags.types.split(',');
    const result = await client.list({ ...config, types });
    printListResult(result);
  } catch (err) {
    handleError(err);
  }
}

function optionBuilder(yargs) {
  return yargs
    .defaults('types', 'environments,builds')
    .example(
      '$0 list services',
      'Lists all existing services/projects associated with your Twilio Account'
    )
    .option('cwd', {
      type: 'string',
      describe: 'Sets the directory from which to deploy',
    })
    .option('environment', {
      type: 'string',
      describe: 'The environment to list variables for.',
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
    });
}

module.exports = {
  command: ['list [types]', 'ls [types]'],
  describe:
    'List existing services, environments, variables, deployments for your Twilio Serverless Account',
  builder: optionBuilder,
  handler,
};
