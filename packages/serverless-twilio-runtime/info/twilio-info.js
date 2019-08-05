'use strict';

const { getTwilioClient } = require('../util/util');
const { api } = require('@twilio-labs/serverless-api');
const { listEnvironments, listServices } = api;

class TwilioInfo {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.hooks = {
      'info:info': this.logInfo.bind(this)
    };
  }

  async logInfo() {
    const serverless = this.serverless;
    const twilioServerlessClient = getTwilioClient(serverless);
    const httpClient = twilioServerlessClient.getClient();

    const services = await listServices(httpClient);
    const currentService = services.find(
      s => s.unique_name === serverless.service.service
    );

    const environments = await listEnvironments(currentService.sid, httpClient);
    const currentEnvironment = environments.find(
      env => env.domain_suffix === serverless.service.provider.environment
    );

    const info = await twilioServerlessClient.list({
      serviceName: serverless.service.service,
      environment: currentEnvironment.sid,
      types: ['assets', 'builds', 'functions', 'variables']
    });

    console.log(`
Service information
*******

Service: ${currentService.unique_name}
Service Sid: ${currentService.sid}

Environment: ${currentEnvironment.domain_suffix}
Environment unique name: ${currentEnvironment.unique_name}
Environment Sid: ${currentEnvironment.sid}
Environment domain name: ${currentEnvironment.domain_name}
Environment variables:
  ${info.variables.entries.map(v => `${v.key}: ${v.value}`).join('\n  ')}

Assets:
  ${info.assets.entries
    .map(a =>
      [
        `access: ${a.visibility}`,
        `creation date: ${a.date_created}`,
        `path: ${a.path}`,
        `sid: ${a.sid}`,
        `url: https://${currentEnvironment.domain_name}${a.path}`
      ].join('\n  ')
    )
    .join('\n\n  ')}

Functions:
  ${info.functions.entries
    .map(f =>
      [
        `access: ${f.visibility}`,
        `creation date: ${f.date_created}`,
        `path: ${f.path}`,
        `sid: ${f.sid}`,
        `url: https://${currentEnvironment.domain_name}${f.path}`
      ].join('\n  ')
    )
    .join('\n\n  ')}


`);
  }
}

module.exports = TwilioInfo;
