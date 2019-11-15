const yargs = require('yargs');
const ListTemplateCommand = require('twilio-run/dist/commands/list-templates');

const DefaultCommand = require('./command');

function cli(cwd) {
  yargs.help();
  yargs.alias('h', 'help');
  yargs.version();
  yargs.alias('v', 'version');
  yargs.default('path', cwd);
  yargs.usage(DefaultCommand.describe);
  yargs.command(DefaultCommand);
  yargs.command(ListTemplateCommand);
  return yargs;
}

module.exports = cli;
