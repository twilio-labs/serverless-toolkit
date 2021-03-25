const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { upload } = require('../../upload');

class UploadCommand extends TwilioClientCommand {
  async run() {
    await super.run();
    const { args } = this.parse(UploadCommand);
    return upload({
      apiKey: this.currentProfile.apiKey,
      apiSecret: this.currentProfile.apiSecret,
      accountSid: this.currentProfile.accountSid,
      configDir: this.config.configDir,
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
