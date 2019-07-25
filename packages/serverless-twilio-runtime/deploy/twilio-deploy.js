'use strict';

const { logDeployedResources } = require('../util/log');
const { getTwilioClient, getTwilioDeployConfig } = require('../util/util');

class TwilioDeploy {
  constructor(serverless, options) {
    this.serverless = serverless;

    this.hooks = {
      'deploy:deploy': this.deploy.bind(this)
    };
  }

  async deploy() {
    const serverless = this.serverless;
    const twilioServerlessClient = getTwilioClient(serverless);
    const config = await getTwilioDeployConfig(serverless);
    const result = await twilioServerlessClient.deployProject(config);

    logDeployedResources(serverless, result);
  }
}

module.exports = TwilioDeploy;
