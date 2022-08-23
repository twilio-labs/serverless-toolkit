const { Command } = require('@oclif/core');

const { handler, cliInfo, describe } = require('twilio-run/dist/commands/new');
const {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
} = require('../../utils');

const { flags, aliasMap } = convertYargsOptionsToOclifFlags(cliInfo.options);

class FunctionsNew extends Command {
  async run() {
    let { flags, args } = await this.parse(FunctionsNew);
    flags = normalizeFlags(flags, aliasMap, process.argv);

    const opts = Object.assign({}, flags, args);
    return handler(opts, undefined);
  }
}

FunctionsNew.description = describe;

FunctionsNew.args = [
  {
    name: 'namespace',
    required: false,
    description: 'The namespace your assets/functions should be grouped under',
  },
];

FunctionsNew.flags = Object.assign(flags);

module.exports = FunctionsNew;
