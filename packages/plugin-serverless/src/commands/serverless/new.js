const { Command } = require('@oclif/command');

const { handler, cliInfo, describe } = require('twilio-run/dist/commands/new');
const {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
} = require('../../utils');

class FunctionsNew extends Command {
  async run() {
    let { flags, args } = this.parse(FunctionsNew);
    flags = normalizeFlags(flags);

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

FunctionsNew.flags = Object.assign(
  convertYargsOptionsToOclifFlags(cliInfo.options)
);

module.exports = FunctionsNew;
