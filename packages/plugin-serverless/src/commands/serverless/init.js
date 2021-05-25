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

const { flags, aliasMap } = convertYargsOptionsToOclifFlags(cliInfo.options);

class FunctionsInit extends TwilioClientCommand {
  async run() {
    await super.run();

    let { flags, args } = this.parse(FunctionsInit);
    flags = normalizeFlags(flags, aliasMap, process.argv);

    const opts = Object.assign({}, flags, args);
    opts.accountSid = flags.accountSid || this.twilioClient.accountSid;
    opts.authToken = flags.authToken || '';

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
    description:
      'Name of Serverless project and directory that will be created',
  },
];

FunctionsInit.flags = Object.assign({}, flags, {
  profile: TwilioClientCommand.flags.profile,
});

module.exports = FunctionsInit;
