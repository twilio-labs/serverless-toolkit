const inquirer = require('inquirer');

function validateAccountSid(input) {
  if (input.startsWith('AC') || input === '') {
    return true;
  } else {
    return 'An Account SID starts with "AC".';
  }
}

async function promptForAccountDetails(config) {
  if (config.skipCredentials) return {};
  const questions = [];
  if (typeof config.accountSid === 'undefined') {
    questions.push({
      type: 'input',
      name: 'accountSid',
      message: 'Twilio Account SID',
      validate: input => {
        return validateAccountSid(input);
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
