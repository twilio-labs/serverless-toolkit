const { flags } = require('@oclif/command');
const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { list } = require('../../list');

class ListCommand extends TwilioClientCommand {
  async run() {
    await super.run();

    try {
      const assets = await list({
        apiKey: this.currentProfile.apiKey,
        apiSecret: this.currentProfile.apiSecret,
        accountSid: this.currentProfile.accountSid,
        configDir: this.config.configDir,
        logger: this.logger,
      });
      this.output(assets, this.flags.properties);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}

ListCommand.flags = {
  properties: flags.string({
    default: 'sid, path, url, visibility',
    description:
      'The asset properties you would like to display (JSON output always shows all properties).',
  }),
  ...TwilioClientCommand.flags,
};

module.exports = ListCommand;
