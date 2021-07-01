const { createTwilioRunCommand } = require('../../../TwilioRunCommand');

module.exports = createTwilioRunCommand(
  'EnvList',
  'twilio-run/dist/commands/env/env-list',
  ['profile']
);
