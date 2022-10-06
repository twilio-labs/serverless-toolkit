const { Flags } = require('@oclif/core');
const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { getPluginConfig } = require('../../pluginConfig');
const { list } = require('../../list');

class ListCommand extends TwilioClientCommand {
  async run() {
    await super.run();
    try {
      const pluginConfig = getPluginConfig(this);
      const assets = await list({
        apiKey: this.currentProfile.apiKey,
        apiSecret: this.currentProfile.apiSecret,
        accountSid: this.currentProfile.accountSid,
        pluginConfig: pluginConfig,
        logger: this.logger,
      });
      this.output(assets, this.flags.properties);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}

ListCommand.description = 'List all the assets in the service';

ListCommand.flags = {
  properties: Flags.string({
    default: 'sid, path, url, visibility',
    description:
      'The asset properties you would like to display (JSON output always shows all properties).',
  }),
  ...TwilioClientCommand.flags,
};

module.exports = ListCommand;
