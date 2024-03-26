const { Command } = require('@oclif/core');

const {
  handler,
  cliInfo,
  describe,
} = require('twilio-run/dist/commands/start');
const {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
} = require('../../utils');

const { flags, aliasMap } = convertYargsOptionsToOclifFlags(cliInfo.options);

class FunctionsStart extends Command {
  async run() {
    let { flags, args } = await this.parse(FunctionsStart);

    flags = normalizeFlags(flags, aliasMap, process.argv);

    const opts = Object.assign({}, flags, args);
    return handler(opts, undefined);
  }
}

FunctionsStart.description = describe;

FunctionsStart.args = [
  {
    name: 'dir',
    required: false,
    description: 'Root directory to serve local Functions/Assets from',
  },
];

FunctionsStart.flags = Object.assign(flags);

FunctionsStart.aliases = ['serverless:dev', 'serverless:run'];

module.exports = FunctionsStart;
