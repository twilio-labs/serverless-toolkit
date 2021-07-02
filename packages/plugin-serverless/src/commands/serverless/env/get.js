const { createTwilioRunCommand } = require('../../../TwilioRunCommand');

module.exports = createTwilioRunCommand(
  'EnvGet',
  'twilio-run/dist/commands/env/env-get',
  ['profile']
);
