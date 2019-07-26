// const { Command } = require('@oclif/command');
const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;

const { handler, cliInfo, describe } = require('twilio-run/dist/commands/list');
const {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
  createExternalCliOptions,
} = require('../../utils');

class FunctionsList extends TwilioClientCommand {
  constructor(argv, config, secureStorage) {
    super(argv, config, secureStorage);

    this.showHeaders = true;
  }

  async runCommand() {
    let { flags, args } = this.parse(FunctionsList);
    flags = normalizeFlags(flags);

    const externalOptions = createExternalCliOptions(flags, this.twilioClient);

    const opts = Object.assign({}, flags, args);
    return handler(opts, externalOptions);
  }
}

FunctionsList.description = describe;

FunctionsList.args = [
  {
    name: 'types',
    required: false,
    default: cliInfo.argsDefaults.types,
    description:
      'Comma seperated list of things to list (services,environments,functions,assets,variables)',
  },
];

FunctionsList.flags = Object.assign(
  convertYargsOptionsToOclifFlags(cliInfo.options),
  { project: TwilioClientCommand.flags.project }
);

module.exports = FunctionsList;
