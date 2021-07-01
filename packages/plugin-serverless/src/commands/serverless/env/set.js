const { createTwilioRunCommand } = require('../../../TwilioRunCommand');

module.exports = createTwilioRunCommand(
  'EnvSet',
  'twilio-run/dist/commands/env/env-set',
  ['profile']
);
