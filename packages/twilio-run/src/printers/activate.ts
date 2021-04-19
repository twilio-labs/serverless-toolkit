import { ActivateResult } from '@twilio-labs/serverless-api';
import { stripIndent } from 'common-tags';
import { PromoteConfig } from '../config/promote';
import { logger } from '../utils/logger';
import { writeOutput } from '../utils/output';
import { getTwilioConsoleDeploymentUrl, redactPartOfString } from './utils';
import chalk = require('chalk');
import terminalLink = require('terminal-link');

export function printActivateConfig(config: PromoteConfig) {
  const message = chalk`
    {cyan.bold Username} ${config.username}
    {cyan.bold Password} ${redactPartOfString(config.password)}
  `;
  logger.info(stripIndent(message) + '\n');
}

export function printActivateResult(result: ActivateResult) {
  logger.info(chalk.cyan.bold('\nActive build available at:'));
  writeOutput(result.domain);

  const twilioConsoleLogsLink = terminalLink(
    'Open the Twilio Console',
    getTwilioConsoleDeploymentUrl(result.serviceSid, result.environmentSid),
    {
      fallback: (text: string, url: string) => chalk.dim(url),
    }
  );

  logger.info(
    '\n' +
      stripIndent(chalk`
    {cyan.bold View Live Logs:}
      ${twilioConsoleLogsLink}
  `)
  );
}
