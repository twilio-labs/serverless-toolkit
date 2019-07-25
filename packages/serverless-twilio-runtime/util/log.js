'use strict';

function logDeployedResources(serverless, result) {
  if (result.functionResources.length) {
    result.functionResources.forEach(fn =>
      logMessage(
        serverless,
        `Function available at: ${result.domain}${fn.path}`
      )
    );
  }

  if (result.assetResources.length) {
    result.assetResources.forEach(asset =>
      logMessage(
        serverless,
        `Asset available at: ${result.domain}${asset.path}`
      )
    );
  }
}

function logMessage(serverless, message) {
  serverless.cli.log(`twilio-runtime: ${message}`);
}

module.exports = {
  logDeployedResources,
  logMessage
};
