const inquirer = require('inquirer');

async function importCredentials(config) {
  if (
    config.skipCredentials ||
    (typeof process.env.TWILIO_ACCOUNT_SID === 'undefined' &&
      typeof process.env.TWILIO_AUTH_TOKEN === 'undefined')
  ) {
    return {};
  }

  const credentials = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN
  };
  if (config.importCredentials) {
    return credentials;
  }
  const { importCredentials } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'importCredentials',
      message:
        'Your account credentials have been found in your environment variables. Import them?',
      default: true
    }
  ]);
  if (importCredentials) {
    return credentials;
  } else {
    return {};
  }
}

module.exports = importCredentials;
