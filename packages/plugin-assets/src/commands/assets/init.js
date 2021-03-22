const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { TwilioServerlessApiClient } = require('@twilio-labs/serverless-api');
const {
  createService,
} = require('@twilio-labs/serverless-api/dist/api/services');
const {
  createEnvironmentFromSuffix,
  getEnvironment,
} = require('@twilio-labs/serverless-api/dist/api/environments');
const ora = require('ora');
const { ConfigStore } = require('../../configStore');
const debug = require('debug')('twilio:assets:init');
const { createErrorHandler } = require('../../errors');
const spinner = ora();
const handleError = createErrorHandler(debug, spinner);

const createServiceAndEnvironment = async client => {
  const serviceSid = await createService('CLI-Assets-Bucket', client);
  const environment = await createEnvironmentFromSuffix('', serviceSid, client);
  return {
    serviceSid,
    environmentSid: environment.sid,
  };
};

class InitCommand extends TwilioClientCommand {
  async run() {
    await super.run();
    spinner.start('Loading config');
    const client = new TwilioServerlessApiClient({
      username: this.currentProfile.apiKey,
      password: this.currentProfile.apiSecret,
    });
    const { accountSid } = this.currentProfile;
    const configStore = new ConfigStore(this.config.configDir);
    const config = await configStore.load();
    if (config[accountSid]?.serviceSid && config[accountSid]?.environmentSid) {
      spinner.text = 'Checking existing service';
      const { serviceSid, environmentSid } = config[accountSid];
      try {
        const environment = await getEnvironment(
          environmentSid,
          serviceSid,
          client
        );
        spinner.stop();
        console.log(`Assets base URL is ${environment.domain_name}`);
      } catch (error) {
        handleError(error);
      }
    } else {
      try {
        spinner.text = 'Creating new assets service and environment';
        const accountConfig = await createServiceAndEnvironment(client);
        config[accountSid] = accountConfig;
        try {
          await configStore.save(config);
          spinner.stop();
        } catch (error) {
          handleError(error);
        }
      } catch (error) {
        handleError(error);
      }
    }
  }
}

InitCommand.flags = { profile: TwilioClientCommand.flags.profile };

InitCommand.description = 'Create a new assets service to use as a bucket';

module.exports = InitCommand;
