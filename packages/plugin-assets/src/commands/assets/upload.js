const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { getPluginConfig } = require('../../pluginConfig');
const { upload } = require('../../upload');

class UploadCommand extends TwilioClientCommand {
  async run() {
    await super.run();
    const { args } = this.parse(UploadCommand);
    const pluginConfig = getPluginConfig(this);
    return upload({
      apiKey: this.currentProfile.apiKey,
      apiSecret: this.currentProfile.apiSecret,
      accountSid: this.currentProfile.accountSid,
      pluginConfig: pluginConfig,
      file: args.file,
    });
  }
}

UploadCommand.args = [
  {
    name: 'file',
    required: true,
    description: 'The path to the file you want to upload',
  },
];

UploadCommand.flags = { profile: TwilioClientCommand.flags.profile };

module.exports = UploadCommand;
