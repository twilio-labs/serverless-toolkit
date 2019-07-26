import { ActivateConfig } from '@twilio-labs/serverless-api';
import { stripIndent } from 'common-tags';
import { redactPartOfString } from './utils';
import chalk = require('chalk');

export function printActivateConfig(config: ActivateConfig) {
  const message = chalk`
    {cyan.bold Account} ${config.accountSid}
    {cyan.bold Token}   ${redactPartOfString(config.authToken)}
  `;
  process.stderr.write(stripIndent(message) + '\n');
}
