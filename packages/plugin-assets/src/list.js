const {
  getEnvironment,
} = require('@twilio-labs/serverless-api/dist/api/environments');
const { getBuild } = require('@twilio-labs/serverless-api/dist/api/builds');
const { TwilioCliError } = require('@twilio/cli-core').services.error;
const { couldNotGetEnvironment, couldNotGetBuild } = require('./errorMessages');
const { getTwilioClient } = require('./client');

async function list({ pluginConfig, apiKey, apiSecret, accountSid, logger }) {
  let environment;
  const config = await pluginConfig.getConfig();
  if (
    config[accountSid] &&
    config[accountSid].serviceSid &&
    config[accountSid].environmentSid
  ) {
    const { serviceSid, environmentSid } = config[accountSid];
    const client = getTwilioClient(apiKey, apiSecret);
    try {
      logger.debug(
        `Fetching environment with sid ${environmentSid} from service with sid ${serviceSid}`
      );
      environment = await getEnvironment(environmentSid, serviceSid, client);
    } catch (error) {
      logger.debug(error.toString());
      throw new TwilioCliError(
        couldNotGetEnvironment(accountSid, serviceSid, environmentSid)
      );
    }
    if (environment.build_sid) {
      try {
        logger.debug(`Fetching build with sid ${environment.build_sid}`);
        const build = await getBuild(environment.build_sid, serviceSid, client);
        const assets = build.asset_versions.map((assetVersion) => {
          if (
            assetVersion.visibility === 'public' ||
            assetVersion.visibility === 'protected'
          ) {
            assetVersion.url = `https://${environment.domain_name}${assetVersion.path}`;
          } else {
            assetVersion.url = '';
          }
          return assetVersion;
        });
        return assets;
      } catch (error) {
        logger.debug(error.toString());
        throw new TwilioCliError(
          couldNotGetBuild(environment.build_sid, environmentSid, serviceSid)
        );
      }
    } else {
      throw new TwilioCliError(
        "No assets deployed yet. Deploy your first asset with 'twilio assets:upload path/to/file'"
      );
    }
  } else {
    throw new TwilioCliError(
      "No Service Sid or Environment Sid provided. Make sure you run 'twilio assets:init' before listing your assets"
    );
  }
}

module.exports = { list };
