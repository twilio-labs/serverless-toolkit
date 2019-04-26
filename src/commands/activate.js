const path = require('path');
const chalk = require('chalk');
const dotenv = require('dotenv');
const ora = require('ora');
const log = require('debug')('twilio-run:activate');
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

function handleError(err, spinner) {
  log('%O', err);
  spinner.fail(err.message);
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
    const details = config.buildSid
      ? `(${config.buildSid})`
      : `from ${config.sourceEnvironment}`;
    const spinner = ora(
      `Activating build ${details} to ${config.targetEnvironment}`
    ).start();
    const result = await client.activateBuild(config);
    spinner.succeed(
      `Activated new build ${details} on ${config.targetEnvironment}`
    );
  } catch (err) {
    handleError(err);
  }
}

const cliInfo = {
  options: {
    cwd: {
      type: 'string',
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
    accountSid: {
      type: 'string',
      alias: 'u',
      describe:
        'A specific account SID to be used for deployment. Uses fields in .env otherwise',
    },
    authToken: {
      type: 'string',
      alias: 'p',
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
  },
};

function optionBuilder(yargs) {
  yargs = yargs.example(
    '$0 activate --environment=prod --source-environment=dev  ',
    'Promotes the same build that is on the "dev" environment to the "prod" environment'
  );

  yargs = Object.keys(cliInfo.options).reduce((yargs, name) => {
    return yargs.option(name, cliInfo.options[name]);
  }, yargs);

  return yargs;
}

module.exports = {
  command: ['activate', 'promote'],
  describe: 'Promotes an existing deployment to a new environment',
  builder: optionBuilder,
  handler,
  cliInfo,
};
