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

  if (options.deployAll) {
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
  } else if (options.deploySingleFunction) {
    config.functions = [
      await getFunctionResource(serverless, {
        name: options.deploySingleFunction,
        config: serverless.service.functions[options.deploySingleFunction]
      })
    ];
  }

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
  let { access = 'public', path: assetPath } = config;
  let content = await readFile(
    path.join(serverless.config.servicePath, assetPath)
  );

  return { access, content, name, path: assetPath };
}

module.exports = {
  getTwilioClient,
  getTwilioDeployConfig,
  readFile
};
