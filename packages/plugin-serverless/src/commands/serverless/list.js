const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;

const { handler, cliInfo, describe } = require('twilio-run/dist/commands/list');
const {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
  createExternalCliOptions,
  getRegionAndEdge,
} = require('../../utils');

const { flags, aliasMap } = convertYargsOptionsToOclifFlags(cliInfo.options);

class FunctionsList extends TwilioClientCommand {
  async run() {
    await super.run();

    let { flags, args } = this.parse(FunctionsList);
    flags = normalizeFlags(flags, aliasMap);

    const externalOptions = createExternalCliOptions(flags, this.twilioClient);

    const { edge, region } = getRegionAndEdge(flags, this);
    flags.region = region;
    flags.edge = edge;

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
      'Comma separated list of things to list (services,environments,functions,assets,variables)',
  },
];

FunctionsList.flags = Object.assign(flags, {
  profile: TwilioClientCommand.flags.profile,
});

module.exports = FunctionsList;
