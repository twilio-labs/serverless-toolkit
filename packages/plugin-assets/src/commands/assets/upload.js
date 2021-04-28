const { flags } = require('@oclif/command');
const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { getPluginConfig } = require('../../pluginConfig');
const { upload } = require('../../upload');

class UploadCommand extends TwilioClientCommand {
  async run() {
    await super.run();

    try {
      const { args } = this.parse(UploadCommand);
      const pluginConfig = getPluginConfig(this);
      const assets = await upload({
        apiKey: this.currentProfile.apiKey,
        apiSecret: this.currentProfile.apiSecret,
        accountSid: this.currentProfile.accountSid,
        pluginConfig: pluginConfig,
        file: args.file,
        logger: this.logger,
      });
      this.output(assets, this.flags.properties);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}

UploadCommand.description = 'Upload a new asset to the Assets service';

UploadCommand.args = [
  {
    name: 'file',
    required: true,
    description: 'The path to the file you want to upload',
  },
];

UploadCommand.flags = {
  properties: flags.string({
    default: 'sid, path, url, visibility',
    description:
      'The asset properties you would like to display (JSON output always shows all properties).',
  }),
  ...TwilioClientCommand.flags,
};

module.exports = UploadCommand;
