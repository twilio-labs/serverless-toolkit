const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;

const {
  handler,
  cliInfo,
  describe,
} = require('twilio-run/dist/commands/deploy');
const {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
  createExternalCliOptions,
} = require('../../utils');

class FunctionsDeploy extends TwilioClientCommand {
  constructor(argv, config, secureStorage) {
    super(argv, config, secureStorage);

    this.showHeaders = true;
  }

  async runCommand() {
    let { flags, args } = this.parse(FunctionsDeploy);
    flags = normalizeFlags(flags);

    const externalOptions = createExternalCliOptions(flags, this.twilioClient);

    const opts = Object.assign({}, flags, args);
    return handler(opts, externalOptions);
  }
}

FunctionsDeploy.description = describe;

FunctionsDeploy.flags = Object.assign(
  convertYargsOptionsToOclifFlags(cliInfo.options),
  { project: TwilioClientCommand.flags.project }
);

module.exports = FunctionsDeploy;
