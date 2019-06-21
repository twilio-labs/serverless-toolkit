const { flags } = require('@oclif/command');
const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;

const createTwilioFunction = require('create-twilio-function/src/create-twilio-function');
const {
  handler,
  cliInfo,
  describe,
} = require('twilio-run/src/commands/activate');
const { normalizeFlags } = require('../../utils');

class FunctionsInit extends TwilioClientCommand {
  constructor(argv, config, secureStorage) {
    super(argv, config, secureStorage);

    this.showHeaders = true;
  }

  async runCommand() {
    let { flags, args } = this.parse(FunctionsInit);
    flags = normalizeFlags(flags);

    const opts = Object.assign({}, flags, args);
    opts.accountSid = flags.accountSid || this.twilioClient.username;
    opts.authToken = flags.authToken || this.twilioClient.password;

    opts.path = process.cwd();
    opts.skipCredentials = true;
    return createTwilioFunction(opts);
  }
}

FunctionsInit.description = 'Creates a new Twilio Serverless project';

FunctionsInit.args = [
  {
    name: 'name',
    required: true,
    description:
      'Name of Serverless project and directory that will be created',
  },
];

FunctionsInit.flags = Object.assign(
  {},
  {
    'auth-token': flags.string({
      description: 'An auth token or API secret to be used for your project',
    }),
    'account-sid': flags.string({
      description: 'An account SID or API key to be used for your project',
    }),
  },
  { project: TwilioClientCommand.flags.project }
);

module.exports = FunctionsInit;
