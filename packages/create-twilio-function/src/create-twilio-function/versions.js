const pkgJson = require('../../package.json');

module.exports = {
  twilio: '^3.56',
  twilioRuntimeHandler: pkgJson.devDependencies[
    '@twilio/runtime-handler'
  ].replace(/[\^~]/, ''),
  twilioRun: pkgJson.dependencies['twilio-run'],
  node: '18',
  typescript: '^4.9',
  serverlessRuntimeTypes: '^1.1',
  copyfiles: '^2.4.1',
};
