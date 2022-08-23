const { Flags } = require('@oclif/core');
const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { getPluginConfig } = require('../../pluginConfig');
const { upload } = require('../../upload');

class UploadCommand extends TwilioClientCommand {
  async run() {
    await super.run();

    try {
      const visibility = this.flags.protected ? 'protected' : 'public';
      const pluginConfig = getPluginConfig(this);
      const assets = await upload({
        apiKey: this.currentProfile.apiKey,
        apiSecret: this.currentProfile.apiSecret,
        accountSid: this.currentProfile.accountSid,
        pluginConfig: pluginConfig,
        file: this.args.file,
        logger: this.logger,
        visibility,
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
  protected: Flags.boolean({
    default: false,
    description: "Sets the uploaded asset's visibility to 'protected'",
  }),
  properties: Flags.string({
    default: 'sid, path, url, visibility',
    description:
      'The asset properties you would like to display (JSON output always shows all properties).',
  }),
  ...TwilioClientCommand.flags,
};

module.exports = UploadCommand;
