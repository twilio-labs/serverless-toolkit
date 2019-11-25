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

class FunctionsListTemplates extends Command {
  async run() {
    let { flags, args } = this.parse(FunctionsListTemplates);
    flags = normalizeFlags(flags);

    const opts = Object.assign({}, flags, args);
    return handler(opts, undefined);
  }
}

FunctionsListTemplates.description = describe;

FunctionsListTemplates.args = [];

FunctionsListTemplates.flags = Object.assign(
  convertYargsOptionsToOclifFlags(cliInfo.options)
);

module.exports = FunctionsListTemplates;
