const pkgJson = require('../../package.json');

module.exports = {
  twilio: '5.6.0',
  twilioRuntimeHandler: pkgJson.devDependencies[
    '@twilio/runtime-handler'
  ].replace(/[\^~]/, ''),
  twilioRun: pkgJson.dependencies['twilio-run'],
  node: '^20.x || ^22.x',
  typescript: '^5.8.0',
  serverlessRuntimeTypes: '^4.0.1',
  copyfiles: '^2.4.1',
};
