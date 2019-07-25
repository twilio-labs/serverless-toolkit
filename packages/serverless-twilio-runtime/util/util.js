'use strict';

const {
  TwilioServerlessApiClient,
  utils
} = require('@twilio-labs/serverless-api');
const path = require('path');
const { readFile } = utils;
const { logMessage } = require('./log');

/**
 *
 * @param {*} serverless
 */
function getTwilioClient(serverless) {
  const { accountSid, authToken } = serverless.service.provider.config;

  const client = new TwilioServerlessApiClient({
    accountSid,
    authToken
  });

  client.on('status-update', evt => {
    logMessage(serverless, evt.message);
  });

  return client;
}

/**
 *
 * @param {*} serverless
 * @param {*} options
 */
async function getTwilioDeployConfig(serverless, options = {}) {
  const config = {
    env: serverless.service.provider.environmentVars,
    pkgJson: {
      dependencies: serverless.service.provider.dependencies
    },
    serviceName: serverless.service.service,
    functionsEnv: serverless.service.provider.environment || 'dev',
    assets: [],
    functions: [],
    overrideExistingService: true
  };

  config.functions = await Promise.all(
    Object.entries(serverless.service.functions).map(
      async ([name, config]) =>
        await getFunctionResource(serverless, { name, config })
    )
  );

  config.assets = await Promise.all(
    Object.entries(serverless.service.resources.assets).map(
      async ([name, config]) =>
        await getAssetResource(serverless, { name, config })
    )
  );

  console.log(config.assets);

  return config;
}

/**
 *
 * @param {*} serverless
 * @param {*} param1
 */
async function getFunctionResource(serverless, { name, config }) {
  let { access = 'public', path: fnPath, handler } = config;
  let content = await readFile(
    path.join(serverless.config.servicePath, `${handler}.js`)
  );

  return { access, content, name, path: fnPath };
}

/**
 *
 * @param {*} serverless
 * @param {*} param1
 */
async function getAssetResource(serverless, { name, config }) {
  let { access = 'public', filePath, path: urlPath } = config;
  let content = await readFile(
    path.join(serverless.config.servicePath, filePath)
  );

  return { access, content, name, path: urlPath };
}

async function getEnvironment(
  twilioServerlessClient,
  { environmentName, serviceName }
) {
  const { environments } = await twilioServerlessClient.list({
    types: ['environments'],
    serviceName
  });

  const environment = environments.find(
    env => env.domain_suffix === environmentName
  );

  if (!environment) {
    throw new Error(`
  Configured environment "${environmentName}" could not be found.
  Please make sure it is deployed to invoke its functions.`);
  }

  return environment;
}

module.exports = {
  getEnvironment,
  getTwilioClient,
  getTwilioDeployConfig,
  readFile
};
