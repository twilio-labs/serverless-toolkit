const { Command } = require('@oclif/command');

const {
  handler,
  cliInfo,
  describe,
} = require('twilio-run/dist/commands/list-templates');
const {
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
} = require('../../utils');

const { flags, aliasMap } = convertYargsOptionsToOclifFlags(cliInfo.options);

class FunctionsListTemplates extends Command {
  async run() {
    let { flags, args } = this.parse(FunctionsListTemplates);
    flags = normalizeFlags(flags, aliasMap);

    const opts = Object.assign({}, flags, args);
    return handler(opts, undefined);
  }
}

FunctionsListTemplates.description = describe;

FunctionsListTemplates.args = [];

FunctionsListTemplates.flags = Object.assign(flags);

module.exports = FunctionsListTemplates;
