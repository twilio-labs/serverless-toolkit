'use strict';

/**
 * Check if a function name is included in the serverless config
 *
 * @param {Object} serverless
 * @param {string} functionName
 * @throws Error if function name is not include in serverless config
 */
function validateIfFunctionExists(serverless, functionName) {
  const functionExists = Object.keys(serverless.service.functions).includes(
    functionName
  );

  if (!functionExists) {
    throw new Error(`
  Could not find configuration for function names ${functionName}...
  Please check the configuration in your serverless.yml.`);
  }
}

module.exports = {
  validateIfFunctionExists
};
