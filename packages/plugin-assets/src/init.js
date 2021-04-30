const { TwilioServerlessApiClient } = require('@twilio-labs/serverless-api');
const {
  createService,
} = require('@twilio-labs/serverless-api/dist/api/services');
const {
  createEnvironmentFromSuffix,
  getEnvironment,
} = require('@twilio-labs/serverless-api/dist/api/environments');
const { TwilioCliError } = require('@twilio/cli-core').services.error;

const { couldNotGetEnvironment } = require('./errorMessages');

const DEFAULT_ASSET_SERVICE_NAME = 'CLI-Assets-Bucket';

async function createServiceAndEnvironment(client) {
  const serviceSid = await createService(DEFAULT_ASSET_SERVICE_NAME, client);
  const environment = await createEnvironmentFromSuffix('', serviceSid, client);
  return {
    serviceSid,
    environment,
  };
}

async function init({ apiKey, apiSecret, accountSid, pluginConfig, logger }) {
  logger.debug('Loading config');
  const client = new TwilioServerlessApiClient({
    username: apiKey,
    password: apiSecret,
  });
  const config = await pluginConfig.getConfig();
  if (
    config[accountSid] &&
    config[accountSid].serviceSid &&
    config[accountSid].environmentSid
  ) {
    const { serviceSid, environmentSid } = config[accountSid];
    logger.debug(
      `Fetching environment with sid ${environmentSid} from service with sid ${serviceSid}`
    );
    try {
      const environment = await getEnvironment(
        environmentSid,
        serviceSid,
        client
      );
      return environment;
    } catch (error) {
      logger.debug(error.toString());
      throw new TwilioCliError(
        couldNotGetEnvironment(accountSid, serviceSid, environmentSid)
      );
    }
  } else {
    try {
      logger.debug('Creating new assets service and environment');
      const serviceAndEnvironment = await createServiceAndEnvironment(client);
      config[accountSid] = {
        serviceSid: serviceAndEnvironment.serviceSid,
        environmentSid: serviceAndEnvironment.environment.sid,
      };
      await pluginConfig.setConfig(config);
      return serviceAndEnvironment.environment;
    } catch (error) {
      logger.debug(error.toString());
      throw new TwilioCliError(
        `Could not create a new asset service for account ${accountSid}`
      );
    }
  }
}
module.exports = { init };
