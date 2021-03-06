const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { flags } = require('@oclif/command');

class ListCommand extends TwilioClientCommand {
  async run() {
    await super.run();
  }
}

module.exports = ListCommand;
