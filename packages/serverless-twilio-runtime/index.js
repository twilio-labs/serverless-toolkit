'use strict';

const TwilioProvider = require('./provider/twilioProvider');
const TwilioDeploy = require('./deploy/twilio-deploy');
const TwilioInfo = require('./info/twilio-info');
const TwilioInvoke = require('./invoke/twilio-invoke');

class ServerlessPlugin {
  constructor(serverless) {
    this.serverless = serverless;
    this.provider = this.serverless.setProvider('twilio', TwilioProvider);

    this.serverless.pluginManager.addPlugin(TwilioDeploy);
    this.serverless.pluginManager.addPlugin(TwilioInfo);
    this.serverless.pluginManager.addPlugin(TwilioInvoke);
  }
}

module.exports = ServerlessPlugin;
