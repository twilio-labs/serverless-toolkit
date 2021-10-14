const { createTwilioRunCommand } = require('../../../TwilioRunCommand');

module.exports = createTwilioRunCommand(
  'EnvUnset',
  'twilio-run/dist/commands/env/env-unset',
  ['profile']
);
