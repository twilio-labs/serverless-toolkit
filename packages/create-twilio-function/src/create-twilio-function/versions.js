const pkgJson = require('../../package.json');

module.exports = {
  twilio: '5.0.3',
  twilioRuntimeHandler: pkgJson.devDependencies[
    '@twilio/runtime-handler'
  ].replace(/[\^~]/, ''),
  twilioRun: pkgJson.dependencies['twilio-run'],
  node: '18',
  typescript: '^5.3.3',
  serverlessRuntimeTypes: '^1.1',
  copyfiles: '^2.2.0',
};
