const yargs = require('yargs');
const createTwilioFunction = require('./create-twilio-function');

function cli(cwd) {
  yargs.help();
  yargs.alias('h', 'help');
  yargs.version();
  yargs.alias('v', 'version');

  yargs.default('path', process.cwd);

  yargs.usage('Creates a new Twilio Function project');
  yargs.command(
    '$0 <name>',
    'Creates a new Twilio Function project',
    command => {
      command.positional('name', {
        describe: 'Name of your project.',
        type: 'string'
      });
      command.options({
        'account-sid': {
          alias: 'a',
          describe: 'The Account SID for your Twilio account',
          type: 'string'
        },
        'auth-token': {
          alias: 't',
          describe: 'Your Twilio account Auth Token',
          type: 'string'
        },
        'skip-credentials': {
          describe:
            "Don't ask for Twilio account credentials or import them from the environment",
          type: 'boolean',
          default: false
        },
        'import-credentials': {
          describe:
            'Import credentials from the environment variables TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN',
          type: 'boolean',
          default: false
        }
      });
    },
    argv => createTwilioFunction(argv)
  );

  return yargs;
}

module.exports = cli;
