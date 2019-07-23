'use strict';

const TwilioProvider = require('./provider/twilioProvider');
const path = require('path');
const {
  TwilioServerlessApiClient,
  utils
} = require('@twilio-labs/serverless-api');
const { readFile } = utils;

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.provider = this.serverless.setProvider('twilio', TwilioProvider);

    this.commands = {
      deploy: {
        usage: 'Deploy Twilio functions and assets',
        lifecycleEvents: [],
        options: {
          sid: {
            usage:
              'Specify the environment you want to deploy ' +
              '(e.g. "--sid \'AC....\'" or "-s \'AC....\'")',
            required: true,
            shortcut: 's'
          },
          token: {
            usage:
              'Specify your Twilio auth token to deploy' +
              '(e.g. "--token \'a86....\'" or "-t \'a86....\'")',
            required: true,
            shortcut: 'auth'
          },
          env: {
            usage:
              'Specify the environment you want to deploy ' +
              '(e.g. "--env \'staging\'")'
          }
        }
      }
    };

    this.hooks = {
      'deploy:deploy': this.deploy.bind(this)
    };
  }

  async deploy() {
    const serverless = this.serverless;
    const { sid: accountSid, token: authToken } = serverless.variables.options;
    const twilioServerlessClient = new TwilioServerlessApiClient({
      accountSid,
      authToken
    });

    const config = {
      env: serverless.service.provider.environmentVars,
      pkgJson: {
        dependencies: serverless.service.provider.dependencies
      },
      serviceName: serverless.service.service,
      functionsEnv: serverless.service.provider.environment || 'dev',
      assets: [],
      functions: [],
      overrideExistingService: true
    };

    config.functions = await Promise.all(
      Object.entries(serverless.service.functions).map(
        async ([name, fnConfig]) => {
          let { access = 'public', path: fnPath, handler } = fnConfig;
          let content = await readFile(
            path.join(serverless.config.servicePath, `${handler}.js`)
          );

          return { access, content, name, path: fnPath };
        }
      )
    );

    config.assets = await Promise.all(
      Object.entries(serverless.service.resources.assets).map(
        async ([name, assetConfig]) => {
          let { access = 'public', path: assetPath } = assetConfig;
          let content = await readFile(
            path.join(serverless.config.servicePath, assetPath)
          );

          return { access, content, name, path: assetPath };
        }
      )
    );

    twilioServerlessClient.on('status-update', evt => {
      this.serverless.cli.log(evt.message);
    });

    const result = await twilioServerlessClient.deployProject(config);

    result.functionResources.forEach(fn =>
      this.serverless.cli.log(
        `Function available at: ${result.domain}${fn.path}`
      )
    );
    result.assetResources.forEach(asset =>
      this.serverless.cli.log(
        `Asset available at: ${result.domain}${asset.path}`
      )
    );
  }
}

module.exports = ServerlessPlugin;
