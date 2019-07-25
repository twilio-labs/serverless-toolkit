'use strict';

/**
 * Filter the functions and assets of a Runtime deployment result
 * and log them
 *
 * @param {Object} serverless
 * @param {Object} result – result of the runtime deployment
 */
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

/**
 * Log stuff but using `serverless.cli.log`
 *
 * @param {Object} serverless
 * @param {string} message
 */
function logMessage(serverless, message) {
  serverless.cli.log(`twilio-runtime: ${message}`);
}

module.exports = {
  logDeployedResources,
  logMessage
};
