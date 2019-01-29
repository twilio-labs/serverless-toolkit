const { promptForAccountDetails } = require('./create-twilio-function/prompt');

async function createTwilioFunction(config) {
  const accountDetails = await promptForAccountDetails(config);
  config = { ...accountDetails, ...config };
}

module.exports = createTwilioFunction;
