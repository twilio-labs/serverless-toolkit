const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { init } = require('../../init');

class InitCommand extends TwilioClientCommand {
  async run() {
    await super.run();
    await init({
      apiKey: this.currentProfile.apiKey,
      apiSecret: this.currentProfile.apiSecret,
      accountSid: this.currentProfile.accountSid,
      configDir: this.config.configDir,
    });
  }
}

InitCommand.flags = { profile: TwilioClientCommand.flags.profile };

InitCommand.description = 'Create a new assets service to use as a bucket';

module.exports = InitCommand;
