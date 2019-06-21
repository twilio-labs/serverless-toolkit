const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;

const {
  handler,
  cliInfo,
  describe,
} = require('twilio-run/src/commands/activate');
const {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
} = require('../../utils');

class FunctionsActivate extends TwilioClientCommand {
  constructor(argv, config, secureStorage) {
    super(argv, config, secureStorage);

    this.showHeaders = true;
  }

  async runCommand() {
    let { flags, args } = this.parse(FunctionsActivate);
    flags = normalizeFlags(flags);

    if (flags.project === 'default') {
      flags._cliDefault = {
        username: this.twilioClient.username,
        password: this.twilioClient.password,
      };
    } else {
      flags.accountSid = flags.accountSid || this.twilioClient.username;
      flags.authToken = flags.authToken || this.twilioClient.password;
    }

    const opts = Object.assign({}, flags, args);
    return handler(opts);
  }
}

FunctionsActivate.description = describe;

FunctionsActivate.flags = Object.assign(
  {},
  convertYargsOptionsToOclifFlags(cliInfo.options),
  { project: TwilioClientCommand.flags.project }
);

module.exports = FunctionsActivate;
