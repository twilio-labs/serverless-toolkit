const { TwilioClientCommand } = require("@twilio/cli-core").baseCommands;

const {
  handler,
  cliInfo,
  describe,
} = require("twilio-run/dist/commands/deploy");
const {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
  createExternalCliOptions,
  getRegionAndEdge,
} = require("../../utils");

class FunctionsDeploy extends TwilioClientCommand {
  async run() {
    await super.run();

    let { flags, args } = this.parse(FunctionsDeploy);
    flags = normalizeFlags(flags);

    const externalOptions = createExternalCliOptions(flags, this.twilioClient);

    const { edge, region } = getRegionAndEdge(flags, this);
    flags.region = region;
    flags.edge = edge;

    const opts = Object.assign({}, flags, args);
    return handler(opts, externalOptions);
  }
}

FunctionsDeploy.description = describe;

FunctionsDeploy.flags = Object.assign(
  convertYargsOptionsToOclifFlags(cliInfo.options),
  { profile: TwilioClientCommand.flags.profile }
);

module.exports = FunctionsDeploy;
