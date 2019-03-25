const inquirer = require('inquirer');

async function promptForAccountDetails(config) {
  if (config.skipCredentials) return {};
  const questions = [];
  if (typeof config.accountSid === 'undefined') {
    questions.push({
      type: 'input',
      name: 'accountSid',
      message: 'Twilio Account SID',
      validate: input => {
        return input.startsWith('AC') || input === ''
          ? true
          : 'An Account SID starts with "AC".';
      }
    });
  }
  if (typeof config.authToken === 'undefined') {
    questions.push({
      type: 'password',
      name: 'authToken',
      message: 'Twilio auth token'
    });
  }
  return await inquirer.prompt(questions);
}

module.exports = { promptForAccountDetails };
