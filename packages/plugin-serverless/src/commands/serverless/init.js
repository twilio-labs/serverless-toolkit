const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;

const {
  handler,
  cliInfo,
  describe,
} = require('create-twilio-function/src/command');
const {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
} = require('../../utils');

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
    return handler(opts);
  }
}

FunctionsInit.description = describe;

FunctionsInit.args = [
  {
    name: 'name',
    required: true,
    description: 'Name of Serverless project and directory that will be created',
  },
];

FunctionsInit.flags = Object.assign(
  {},
  convertYargsOptionsToOclifFlags(cliInfo.options),
  { profile: TwilioClientCommand.flags.profile }
);

module.exports = FunctionsInit;
