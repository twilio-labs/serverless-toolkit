'use strict';

const {
  TwilioServerlessApiClient,
  utils,
} = require('@twilio-labs/serverless-api');
const path = require('path');
const { readFile } = utils;
const { logMessage } = require('./log');
const pkgJson = require('../package.json');

/**
 * Initialize the Twilio client and attach serverless logging to it
 *
 * @param {Object} serverless
 * @returns TwilioServerlessApiClient
 */
function getTwilioClient(serverless) {
  const { accountSid, authToken } = serverless.service.provider.config;

  const client = new TwilioServerlessApiClient({
    accountSid,
    authToken,
    userAgentExtensions: [
      `@twilio-labs/serverless-twilio-runtime/${pkgJson.version}`,
    ],
  });

  client.on('status-update', (evt) => {
    logMessage(serverless, evt.message);
  });

  return client;
}

/**
 * Extract TwilioServerlessApiClient config from serverless object
 *
 * @param {Object} serverless
 * @param {Object} options
 * @returns {Object}
 */
async function getTwilioDeployConfig(serverless, options = {}) {
  const config = {
    env: serverless.service.provider.environmentVars || {},
    pkgJson: {
      dependencies: serverless.service.provider.dependencies,
    },
    serviceName: serverless.service.service,
    functionsEnv: serverless.service.provider.environment || 'dev',
    assets: [],
    functions: [],
    overrideExistingService: true,
  };

  if (serverless.service.functions) {
    config.functions = await Promise.all(
      Object.entries(serverless.service.functions).map(
        async ([name, config]) =>
          await getFunctionResource(serverless, { name, config })
      )
    );
  }

  if (serverless.service.resources && serverless.service.resources.assets) {
    config.assets = await Promise.all(
      Object.entries(serverless.service.resources.assets).map(
        async ([name, config]) =>
          await getAssetResource(serverless, { name, config })
      )
    );
  }

  return config;
}

/**
 * Retrieve configuration for runtime functions and
 * load resources from disk
 *
 * @param {Object} serverless
 * @param {Object} options
 * @returns {Object}
 */
async function getFunctionResource(serverless, { name, config }) {
  let { access = 'public', path: fnPath, handler } = config;

  if (!fnPath.startsWith('/')) {
    throw new Error(
      `Please start the function \`path\` property with a "/"...

  ->  "${fnPath}" should be "/${fnPath}"`
    );
  }

  let content = await readFile(
    path.join(serverless.config.servicePath, `${handler}.js`)
  );

  return { access, content, name, path: fnPath };
}

/**
 * Retrieve configuration for runtime functions and
 * load resources from disk
 *
 * @param {Object} serverless
 * @param {Object} options
 * @returns {Object}
 */
async function getAssetResource(serverless, { name, config }) {
  let { access = 'public', filePath, path: urlPath } = config;

  if (!urlPath.startsWith('/')) {
    throw new Error(
      `Please start the asset \`path\` property with a "/"...

  ->  "${urlPath}" should be "/${urlPath}"`
    );
  }

  let content = await readFile(
    path.join(serverless.config.servicePath, filePath)
  );

  return { access, content, name, path: urlPath };
}

/**
 *
 * @param {TwilioServerlessApiClient} twilioServerlessClient
 * @param {Object} options
 * @returns {Object}
 */
async function getEnvironment(
  twilioServerlessClient,
  { environmentName, serviceName }
) {
  const { environments } = await twilioServerlessClient.list({
    types: ['environments'],
    serviceName,
  });

  const environment = environments.find(
    (env) => env.domain_suffix === environmentName
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
  readFile,
};
