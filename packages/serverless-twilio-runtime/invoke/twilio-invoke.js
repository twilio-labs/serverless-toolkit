'use strict';

const { validateIfFunctionExists } = require('../util/validate');
const { getEnvironment, getTwilioClient } = require('../util/util');

class TwilioInfo {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.hooks = {
      'invoke:invoke': this.invoke.bind(this)
    };
  }

  async invoke() {
    const serverless = this.serverless;
    const functionName = this.options.f || this.options.function;
    const twilioServerlessClient = getTwilioClient(serverless);
    const httpClient = twilioServerlessClient.getClient();

    validateIfFunctionExists(serverless, functionName);

    const currentEnvironment = await getEnvironment(twilioServerlessClient, {
      environmentName: serverless.service.provider.environment,
      serviceName: serverless.service.service
    });
    const { sid: currentEnvironmentSid } = currentEnvironment;

    const { functions } = await twilioServerlessClient.list({
      types: ['functions'],
      serviceName: serverless.service.service,
      environment: currentEnvironmentSid
    });

    const matchingFn = functions.entries.find(
      fn => fn.path === serverless.service.functions[functionName].path
    );

    if (!matchingFn) {
      throw new Error(`
  The function "${functionName}" could not be found.
  Please make sure it is deployed to invoke it.`);
    }

    let response;

    try {
      response = await httpClient(
        `https://${currentEnvironment.domain_name}${matchingFn.path}`
      );
    } catch (e) {
      response = await httpClient(
        `https://${currentEnvironment.domain_name}${matchingFn.path}`,
        { json: false }
      );
    }

    console.log(response.body);
  }
}

module.exports = TwilioInfo;
