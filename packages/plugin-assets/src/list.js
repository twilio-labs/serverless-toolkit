const { TwilioServerlessApiClient } = require('@twilio-labs/serverless-api');
const {
  getEnvironment,
} = require('@twilio-labs/serverless-api/dist/api/environments');
const { getBuild } = require('@twilio-labs/serverless-api/dist/api/builds');

const { ConfigStore } = require('./configStore');
const { createUtils } = require('./utils');
const { printInBox } = require('./print');

const { spinner, debug, handleError } = createUtils('list');

const list = async ({ configDir, apiKey, apiSecret, accountSid }) => {
  let environment;
  spinner.start('Loading config');
  const configStore = new ConfigStore(configDir);
  const config = await configStore.load();
  if (config[accountSid]?.serviceSid && config[accountSid]?.environmentSid) {
    const { serviceSid, environmentSid } = config[accountSid];
    const client = new TwilioServerlessApiClient({
      username: apiKey,
      password: apiSecret,
    });
    spinner.text = 'Fetching asset URLs';
    try {
      debug(
        `Fetching environment with sid ${environmentSid} from service with sid ${serviceSid}`
      );
      environment = await getEnvironment(environmentSid, serviceSid, client);
    } catch (error) {
      handleError(error, 'Could not fetch asset service environment');
      return;
    }
    if (environment.build_sid) {
      try {
        debug(`Fetching build with sid ${environment.build_sid}`);
        const build = await getBuild(environment.build_sid, serviceSid, client);
        spinner.stop();
        const assets = build.asset_versions.map(
          assetVersion =>
            `https://${environment.domain_name}${assetVersion.path}`
        );
        printInBox('Available assets:', assets.join('\n'));
      } catch (error) {
        handleError(
          error,
          'Could not fetch last build of asset service environment'
        );
        return;
      }
    } else {
      spinner.fail(
        "No assets deployed yet. Deploy your first asset with 'twilio assets:upload path/to/file'"
      );
    }
  } else {
    spinner.fail(
      "No Service Sid or Environment Sid provided. Make sure you run 'twilio assets:init' before listing your assets"
    );
  }
};

module.exports = { list };
