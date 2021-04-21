const { flags } = require('@oclif/command');
const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { init } = require('../../init');

class InitCommand extends TwilioClientCommand {
  async run() {
    await super.run();
    try {
      const result = await init({
        apiKey: this.currentProfile.apiKey,
        apiSecret: this.currentProfile.apiSecret,
        accountSid: this.currentProfile.accountSid,
        pluginConfig: this.pluginConfig,
        logger: this.logger,
      });
      this.output(result, this.flags.properties);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}

InitCommand.flags = {
  properties: flags.string({
    default: 'service_sid, sid, domain_name',
    description:
      'The asset service environment properties you would like to display (JSON output always shows all properties).',
  }),
  ...TwilioClientCommand.flags,
};

InitCommand.description = 'Create a new assets service to use as a bucket';

module.exports = InitCommand;
