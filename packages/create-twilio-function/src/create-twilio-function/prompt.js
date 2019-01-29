const inquirer = require('inquirer');

async function promptForAccountDetails(config) {
  const questions = [];
  if (!config.accountSid) {
    questions.push({
      type: 'input',
      name: 'accountSid',
      message: 'Twilio Account SID',
      validate: input =>
        input.startsWith('AC') ? true : 'An Account SID starts with "AC".'
    });
  }
  if (!config.authToken) {
    questions.push({
      type: 'password',
      name: 'authToken',
      message: 'Twilio auth token'
    });
  }
  return await inquirer.prompt(questions);
}

module.exports = { promptForAccountDetails };
