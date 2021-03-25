const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { list } = require('../../list');

class ListCommand extends TwilioClientCommand {
  async run() {
    await super.run();
    return list({
      apiKey: this.currentProfile.apiKey,
      apiSecret: this.currentProfile.apiSecret,
      accountSid: this.currentProfile.accountSid,
      configDir: this.config.configDir,
    });
  }
}

ListCommand.flags = { profile: TwilioClientCommand.flags.profile };

module.exports = ListCommand;
