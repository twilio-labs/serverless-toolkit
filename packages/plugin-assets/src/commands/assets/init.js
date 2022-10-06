const { Flags } = require('@oclif/core');
const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { getPluginConfig } = require('../../pluginConfig');
const generateProjectName = require('project-name-generator');

const { init } = require('../../init');

class InitCommand extends TwilioClientCommand {
  async run() {
    await super.run();
    try {
      const pluginConfig = getPluginConfig(this);
      const result = await init({
        apiKey: this.currentProfile.apiKey,
        apiSecret: this.currentProfile.apiSecret,
        accountSid: this.currentProfile.accountSid,
        pluginConfig: pluginConfig,
        logger: this.logger,
        serviceName: (
          this.flags['service-name'] || generateProjectName().dashed
        ).trim(),
      });
      this.output(result, this.flags.properties);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}

InitCommand.flags = {
  'service-name': Flags.string({
    description:
      'A unique name for your asset service. May only contain alphanumeric characters and hyphens.',
  }),
  properties: Flags.string({
    default: 'service_sid, sid, domain_name',
    description:
      'The asset service environment properties you would like to display (JSON output always shows all properties).',
  }),
  ...TwilioClientCommand.flags,
};

InitCommand.description = 'Create a new assets service to use as a bucket';

module.exports = InitCommand;
