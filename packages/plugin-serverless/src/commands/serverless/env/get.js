const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;

const {
  handler,
  cliInfo,
  describe,
} = require('twilio-run/dist/commands/env/env-get');
const {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
  createExternalCliOptions,
  getRegionAndEdge,
} = require('../../../utils');

const { flags, aliasMap } = convertYargsOptionsToOclifFlags(cliInfo.options);

class EnvGet extends TwilioClientCommand {
  async run() {
    await super.run();

    let { flags, args } = this.parse(EnvGet);
    flags = normalizeFlags(flags, aliasMap, process.argv);

    const externalOptions = createExternalCliOptions(flags, this.twilioClient);

    const { edge, region } = getRegionAndEdge(flags, this);
    flags.region = region;
    flags.edge = edge;

    const opts = Object.assign({}, flags, args);
    return handler(opts, externalOptions);
  }
}

EnvGet.description = describe;

EnvGet.flags = Object.assign(flags, {
  profile: TwilioClientCommand.flags.profile,
});

module.exports = EnvGet;
