const { Command } = require('@oclif/command');

const { handler, cliInfo, describe } = require('twilio-run/dist/commands/new');
const {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
} = require('../../utils');

class FunctionsNew extends Command {
  constructor(argv, config, secureStorage) {
    super(argv, config, secureStorage);

    this.showHeaders = true;
  }

  async run() {
    let { flags, args } = this.parse(FunctionsNew);
    flags = normalizeFlags(flags);

    const opts = Object.assign({}, flags, args);
    return handler(opts);
  }
}

FunctionsNew.description = describe;

FunctionsNew.args = [
  {
    name: 'filename',
    required: false,
    description: 'Name for the function to be created',
  },
];

FunctionsNew.flags = Object.assign(
  convertYargsOptionsToOclifFlags(cliInfo.options)
);

module.exports = FunctionsNew;
