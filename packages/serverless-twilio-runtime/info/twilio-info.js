'use strict';

const { logMessage } = require('../util/log');

class TwilioInfo {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.hooks = {
      'info:info': this.logInfo.bind(this)
    };
  }

  async logInfo() {
    logMessage(this.serverless, `'serverless info' is not yet implemented...`);
  }
}

module.exports = TwilioInfo;
