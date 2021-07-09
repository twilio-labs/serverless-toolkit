const pkgJson = require('../package.json');
const { TwilioServerlessApiClient } = require('@twilio-labs/serverless-api');

function getTwilioClient(apiKey, apiSecret) {
  return new TwilioServerlessApiClient({
    username: apiKey,
    password: apiSecret,
    userAgentExtensions: [`@twilio-labs/plugin-assets/${pkgJson.version}`],
  });
}

module.exports = { getTwilioClient: getTwilioClient };
