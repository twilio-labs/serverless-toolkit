const { TwilioServerlessApiClient } = require('@twilio-labs/serverless-api');
const {
  createService,
} = require('@twilio-labs/serverless-api/dist/api/services');
const {
  createEnvironmentFromSuffix,
  getEnvironment,
} = require('@twilio-labs/serverless-api/dist/api/environments');
const { ConfigStore } = require('./configStore');
const { createUtils } = require('./utils');
const { printInBox } = require('./print');

const { spinner, debug, handleError } = createUtils('init');

const DEFAULT_ASSET_SERVICE_NAME = 'CLI-Assets-Bucket';

const createServiceAndEnvironment = async client => {
  const serviceSid = await createService(DEFAULT_ASSET_SERVICE_NAME, client);
  const environment = await createEnvironmentFromSuffix('', serviceSid, client);
  return {
    serviceSid,
    environmentSid: environment.sid,
  };
};

const init = async ({ apiKey, apiSecret, accountSid, configDir }) => {
  spinner.start('Loading config');
  const client = new TwilioServerlessApiClient({
    username: apiKey,
    password: apiSecret,
  });
  const configStore = new ConfigStore(configDir);
  const config = await configStore.load();
  if (config[accountSid]?.serviceSid && config[accountSid]?.environmentSid) {
    spinner.text = 'Existing service found. Loading';
    const { serviceSid, environmentSid } = config[accountSid];
    try {
      const environment = await getEnvironment(
        environmentSid,
        serviceSid,
        client
      );
      spinner.stop();
      printInBox(
        `Assets base URL is ${environment.domain_name}`,
        "Run 'twilio assets:list' to see the available assets"
      );
    } catch (error) {
      handleError(error);
    }
  } else {
    try {
      spinner.text = 'Creating new assets service and environment';
      const accountConfig = await createServiceAndEnvironment(client);
      config[accountSid] = accountConfig;
      await configStore.save(config);
      spinner.stop();
    } catch (error) {
      handleError(error);
    }
  }
};
module.exports = { init };
