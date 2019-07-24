'use strict';

const { logDeployedResources } = require('../util/log');
const { getTwilioClient, getTwilioDeployConfig } = require('../util/util');
const { validateIfFunctionExists } = require('../util/validate');

class TwilioDeploy {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.hooks = {
      'deploy:function:deploy': this.deployFunction.bind(this)
    };
  }

  async deployFunction() {
    const serverless = this.serverless;
    const functionName = this.options.f || this.options.function;
    const twilioServerlessClient = getTwilioClient(serverless);

    validateIfFunctionExists(serverless, functionName);

    const config = await getTwilioDeployConfig(serverless, {
      deploySingleFunction: functionName
    });
    const result = await twilioServerlessClient.deployProject(config);

    logDeployedResources(serverless, result);
  }
}

module.exports = TwilioDeploy;
