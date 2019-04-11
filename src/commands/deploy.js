const path = require('path');
const chalk = require('chalk');
const dotenv = require('dotenv');
const ora = require('ora');
const log = require('debug')('twilio-run:deploy');

const { TwilioServerlessApiClient } = require('@twilio-labs/serverless-api');

const { fileExists, readFile, writeFile } = require('../utils/fs');

async function getFunctionServiceSid(cwd) {
  const configPath = path.join(cwd, '.twilio-functions');
  if (!(await fileExists(configPath))) {
    return undefined;
  }

  try {
    const twilioConfig = JSON.parse(await readFile(configPath, 'utf8'));
    return twilioConfig.serviceSid;
  } catch (err) {
    log('Could not find local config');
    return undefined;
  }
}

async function saveLatestDeploymentData(cwd, serviceSid, buildSid) {
  const configPath = path.join(cwd, '.twilio-functions');
  if (!(await fileExists(configPath))) {
    const output = JSON.stringify(
      { serviceSid, latestBuild: buildSid },
      null,
      2
    );
    return writeFile(configPath, output, 'utf8');
  }

  try {
    const twilioConfig = JSON.parse(await readFile(configPath, 'utf8'));
    const output = JSON.stringify({ ...twilioConfig, serviceSid });
    return writeFile(configPath, output, 'utf8');
  } catch (err) {
    const output = JSON.stringify({ serviceSid }, null, 2);
    return writeFile(configPath, output, 'utf8');
  }
}

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
    projectName: flags.projectName || pkgJson.name,
    functionsEnv: flags.functionsEnv,
  };
}

function logError(msg) {
  console.error(chalk`{red.bold ERROR} ${msg}`);
}

function printDeployedResources(config, output) {
  console.log(
    chalk`
{bold Deployment Details}
⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺⎺
{bold Domain:} ${output.domain}
{bold Service:}
   ${config.projectName} {dim (${output.serviceSid})}
{bold Environment:}
   ${config.functionsEnv} {dim (${output.environmentSid})} 
{bold Build SID:}
   ${output.buildSid}
  `.trim()
  );
  if (output.functionResources) {
    const functionMessage = output.functionResources
      .map(fn => {
        return chalk`   {dim https://${output.domain}}${fn.functionPath}`;
      })
      .join('\n');
    console.log(chalk.bold('Functions:'));
    console.log(functionMessage);
  }

  if (output.assetResources) {
    const assetMessage = output.assetResources
      .map(fn => {
        return chalk`   {dim https://${output.domain}}${fn.assetPath}`;
      })
      .join('\n');

    console.log(chalk.bold('Assets:'));
    console.log(assetMessage);
  }
}

function printConfigInfo(config) {
  console.log(
    chalk`
Deploying functions & assets to Twilio Serverless

{bold Account}\t\t${config.accountSid}
{bold Project Name}\t${config.projectName}
{bold Environment}\t${config.functionsEnv}
{bold Root Directory}\t${config.cwd}
{bold Dependencies}\t${Object.keys(config.pkgJson.dependencies).join(', ')}
{bold Env Variables}\t${Object.keys(config.env).join(', ')}
`
  );
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
    log(err);
    spinner.fail(err.message);
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
    });
}

module.exports = {
  command: ['deploy'],
  describe: 'Deploys existing functions and assets to Twilio',
  builder: optionBuilder,
  handler,
};
