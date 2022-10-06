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

const { flags, aliasMap } = convertYargsOptionsToOclifFlags(cliInfo.options);

class FunctionsPromote extends TwilioClientCommand {
  async run() {
    await super.run();

    const flags = normalizeFlags(this.flags, aliasMap, process.argv);

    const externalOptions = createExternalCliOptions(flags, this.twilioClient);

    const { edge, region } = getRegionAndEdge(flags, this);
    flags.region = region;
    flags.edge = edge;

    const opts = Object.assign({}, flags, this.args);
    return handler(opts, externalOptions);
  }
}

FunctionsPromote.description = describe;

FunctionsPromote.flags = Object.assign({}, flags, {
  profile: TwilioClientCommand.flags.profile,
});

FunctionsPromote.aliases = ['serverless:activate'];

module.exports = FunctionsPromote;
