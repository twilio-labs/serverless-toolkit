const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;

const {
  handler,
  cliInfo,
  describe,
} = require('twilio-run/dist/commands/promote');
const {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
  createExternalCliOptions,
  getRegionAndEdge,
} = require('../../utils');

class FunctionsPromote extends TwilioClientCommand {
  async run() {
    await super.run();

    let { flags, args } = this.parse(FunctionsPromote);
    flags = normalizeFlags(flags);

    const externalOptions = createExternalCliOptions(flags, this.twilioClient);

    const { edge, region } = getRegionAndEdge(flags, this);
    flags.region = region;
    flags.edge = edge;

    const opts = Object.assign({}, flags, args);
    return handler(opts, externalOptions);
  }
}

FunctionsPromote.description = describe;

FunctionsPromote.flags = Object.assign(
  {},
  convertYargsOptionsToOclifFlags(cliInfo.options),
  { profile: TwilioClientCommand.flags.profile }
);

FunctionsPromote.aliases = ['serverless:activate'];

module.exports = FunctionsPromote;
