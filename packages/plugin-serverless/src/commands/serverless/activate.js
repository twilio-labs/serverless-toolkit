const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;

const {
  handler,
  cliInfo,
  describe,
} = require('twilio-run/dist/commands/activate');
const {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
  createExternalCliOptions,
} = require('../../utils');

class FunctionsActivate extends TwilioClientCommand {
  async run() {
    await super.run();

    let { flags, args } = this.parse(FunctionsActivate);
    flags = normalizeFlags(flags);

    const externalOptions = createExternalCliOptions(flags, this.twilioClient);

    const opts = Object.assign({}, flags, args);
    return handler(opts, externalOptions);
  }
}

FunctionsActivate.description = describe;

FunctionsActivate.flags = Object.assign(
  {},
  convertYargsOptionsToOclifFlags(cliInfo.options),
  { profile: TwilioClientCommand.flags.profile }
);

module.exports = FunctionsActivate;
