const inquirer = require('inquirer');
const terminalLink = require('terminal-link');

const validateProjectName = require('./validate-project-name');

function validateAccountSid(input) {
  if (input.startsWith('AC') || input === '') {
    return true;
  }
  return 'An Account SID starts with "AC".';
}

function promptForAccountDetails(config) {
  if (config.skipCredentials) {
    return {};
  }
  const questions = [];
  if (typeof config.accountSid === 'undefined') {
    questions.push({
      type: 'input',
      name: 'accountSid',
      message: 'Twilio Account SID',
      validate: validateAccountSid,
    });
  }
  if (typeof config.authToken === 'undefined') {
    questions.push({
      type: 'password',
      name: 'authToken',
      message: 'Twilio auth token',
    });
  }
  if (questions.length > 0) {
    console.log(
      `Please enter your Twilio credentials which you can find in your ${terminalLink(
        'Twilio console',
        'https://twil.io/your-console',
      )}.`,
    );
  }
  return inquirer.prompt(questions);
}

function promptForProjectName(err) {
  const questions = [
    {
      type: 'input',
      name: 'name',
      message: `Project names ${err.join(', ')}. Please choose a new project name.`,
      validate: (name) => {
        const { valid, errors } = validateProjectName(name);
        if (valid) {
          return valid;
        }
        return `Project ${errors.join(', ')}.`;
      },
    },
  ];
  return inquirer.prompt(questions);
}

module.exports = {
  promptForAccountDetails,
  promptForProjectName,
  validateAccountSid,
};
