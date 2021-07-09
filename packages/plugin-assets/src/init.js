const {
  createService,
} = require('@twilio-labs/serverless-api/dist/api/services');
const {
  createEnvironmentFromSuffix,
  getEnvironment,
} = require('@twilio-labs/serverless-api/dist/api/environments');
const { TwilioCliError } = require('@twilio/cli-core').services.error;

const { couldNotGetEnvironment } = require('./errorMessages');
const { getTwilioClient } = require('./client');

async function createServiceAndEnvironment(client, serviceName) {
  const serviceSid = await createService(serviceName, client);
  const environment = await createEnvironmentFromSuffix('', serviceSid, client);
  return {
    serviceSid,
    environment,
  };
}

function validateServiceName(serviceName) {
  if (!serviceName.match(/^(?=.*$)[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/)) {
    throw new TwilioCliError(
      `Service name may only contain alphanumeric characters and hyphens.`
    );
  }
}

async function init({
  apiKey,
  apiSecret,
  accountSid,
  pluginConfig,
  logger,
  serviceName,
}) {
  logger.debug('Loading config');
  const client = getTwilioClient(apiKey, apiSecret);
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
      validateServiceName(serviceName);
      const serviceAndEnvironment = await createServiceAndEnvironment(
        client,
        serviceName
      );
      config[accountSid] = {
        serviceSid: serviceAndEnvironment.serviceSid,
        environmentSid: serviceAndEnvironment.environment.sid,
      };
      await pluginConfig.setConfig(config);
      return serviceAndEnvironment.environment;
    } catch (error) {
      logger.debug(error.toString());
      if (error.name === 'TwilioCliError') {
        throw error;
      } else {
        throw new TwilioCliError(
          `Could not create a new asset service for account ${accountSid}`
        );
      }
    }
  }
}
module.exports = { init };
