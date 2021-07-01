const { createTwilioRunCommand } = require('../../../TwilioRunCommand');

module.exports = createTwilioRunCommand(
  'EnvImport',
  'twilio-run/dist/commands/env/env-import',
  ['profile']
);
