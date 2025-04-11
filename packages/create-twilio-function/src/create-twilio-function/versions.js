const pkgJson = require('../../package.json');

module.exports = {
  twilio: '5.0.3',
  twilioRuntimeHandler: pkgJson.devDependencies[
    '@twilio/runtime-handler'
  ].replace(/[\^~]/, ''),
  twilioRun: pkgJson.dependencies['twilio-run'],
  node: '22',
  typescript: '^5.3.3',
  serverlessRuntimeTypes: '^4.0.0',
  copyfiles: '^2.4.1',
};
