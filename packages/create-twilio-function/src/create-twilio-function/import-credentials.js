const inquirer = require('inquirer');

const questions = [
  {
    type: 'confirm',
    name: 'importedCredentials',
    message: 'Your account credentials have been found in your environment variables. Import them?',
    default: true,
  },
];

async function importCredentials(config) {
  if (config.skipCredentials) {
    return {};
  }

  const credentials = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  };
  if (typeof credentials.accountSid === 'undefined' && typeof credentials.authToken === 'undefined') {
    return {};
  }

  if (config.importedCredentials) {
    return credentials;
  }

  const { importedCredentials } = await inquirer.prompt(questions);
  return importedCredentials ? credentials : {};
}

module.exports = importCredentials;
