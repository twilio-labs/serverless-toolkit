const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { flags } = require('@oclif/command');

class UploadCommand extends TwilioClientCommand {
  async run() {
    await super.run();
    console.log('Assets upload');
  }
}

module.exports = UploadCommand;
